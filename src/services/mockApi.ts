// API falsa: imita a API de SOA guardando os dados no próprio celular
// (AsyncStorage). Permite construir e demonstrar o app inteiro sem depender
// do backend. Os dados sobrevivem ao fechar o app.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Analise, NovaAnalise, NovoCadastro, NovoPedido, Pedido, RespostaPedido, Usuario } from '../types';
import { ehAnalise, ehListaDe, ehObjeto, ehPedido, ehUsuario } from '../types/guards';
import { agoraIso, apenasDigitos, ErroApp, ErroCredenciais, esperar, gerarId } from '../utils';
import { analisarTexto } from './analisador';
import { ATRASO_MOCK_MS, SIMULAR_FALHA } from './config';
import { gerarSal, hashDoPin } from './seguranca';
import type { ApiCliente } from './tipos';

const CHAVE_BANCO = '@alethos/banco-mock/v1';

/** Como a conta fica guardada: o PIN só existe como hash, junto com o sal. */
interface UsuarioGuardado extends Usuario {
  sal: string;
  pinHash: string;
  criadoEm: string;
}

interface Banco {
  usuarios: UsuarioGuardado[];
  analises: Analise[];
  pedidos: Pedido[];
}

const BANCO_VAZIO: Banco = { usuarios: [], analises: [], pedidos: [] };

function ehUsuarioGuardado(valor: unknown): valor is UsuarioGuardado {
  return (
    ehUsuario(valor) &&
    ehObjeto(valor) &&
    typeof valor.sal === 'string' &&
    typeof valor.pinHash === 'string' &&
    typeof valor.criadoEm === 'string'
  );
}

function ehBanco(valor: unknown): valor is Banco {
  return (
    ehObjeto(valor) &&
    ehListaDe(ehUsuarioGuardado)(valor.usuarios) &&
    ehListaDe(ehAnalise)(valor.analises) &&
    ehListaDe(ehPedido)(valor.pedidos)
  );
}

/** Devolve só os dados públicos da conta: sal e hash nunca saem do "servidor". */
function publico({ id, nome, telefone, perfil }: UsuarioGuardado): Usuario {
  return { id, nome, telefone, perfil };
}

async function lerBanco(): Promise<Banco> {
  const texto = await AsyncStorage.getItem(CHAVE_BANCO);
  if (texto === null) return BANCO_VAZIO;
  try {
    const valor: unknown = JSON.parse(texto);
    return ehBanco(valor) ? valor : BANCO_VAZIO;
  } catch {
    return BANCO_VAZIO; // dado corrompido: recomeça do zero em vez de travar o app
  }
}

async function gravarBanco(banco: Banco): Promise<void> {
  await AsyncStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
}

/** Simula a demora e, se configurado, a falha da rede. */
async function simularRede(podeFalhar: boolean): Promise<void> {
  await esperar(ATRASO_MOCK_MS);
  if (podeFalhar && SIMULAR_FALHA) {
    throw new ErroApp('Não consegui falar com o servidor (falha simulada). Toque em Tentar de novo.');
  }
}

/** Cria uma função de ordenação "mais recente primeiro" a partir de qualquer campo de data. */
const maisRecentePrimeiro =
  <T,>(data: (item: T) => string) =>
  (a: T, b: T) =>
    data(b).localeCompare(data(a));

export const mockApi: ApiCliente = {
  async cadastrar(dados: NovoCadastro) {
    await simularRede(false);
    const banco = await lerBanco();
    const telefone = apenasDigitos(dados.telefone);
    if (banco.usuarios.some((u) => u.telefone === telefone)) {
      throw new ErroApp('Este telefone já tem conta. Volte e toque em Entrar.');
    }
    const sal = gerarSal();
    const novo: UsuarioGuardado = {
      id: gerarId(),
      nome: dados.nome.trim(),
      telefone,
      perfil: dados.perfil,
      sal,
      pinHash: await hashDoPin(sal, dados.pin),
      criadoEm: agoraIso(),
    };
    await gravarBanco({ ...banco, usuarios: [...banco.usuarios, novo] });
    return publico(novo);
  },

  async autenticar(telefone, pin) {
    await simularRede(false);
    const { usuarios } = await lerBanco();
    const conta = usuarios.find((u) => u.telefone === apenasDigitos(telefone));
    // A mesma mensagem para "telefone não existe" e "PIN errado": assim ninguém
    // descobre quais telefones têm conta tentando no login.
    if (!conta || (await hashDoPin(conta.sal, pin)) !== conta.pinHash) {
      throw new ErroCredenciais();
    }
    return publico(conta);
  },

  async listarAnalises(usuarioId) {
    await simularRede(true);
    const { analises } = await lerBanco();
    return analises
      .filter((a) => a.usuarioId === usuarioId)
      .sort(maisRecentePrimeiro((a) => a.criadaEm));
  },

  async buscarAnalise(id) {
    await simularRede(true);
    const { analises } = await lerBanco();
    const analise = analises.find((a) => a.id === id);
    if (!analise) throw new ErroApp('Não encontrei esta análise.');
    return analise;
  },

  async criarAnalise(dados: NovaAnalise) {
    await simularRede(false);
    const banco = await lerBanco();
    const nova: Analise = {
      id: gerarId(),
      ...dados,
      ...analisarTexto(dados.texto), // na API real, quem faz isso é o modelo de ML
      criadaEm: agoraIso(),
    };
    await gravarBanco({ ...banco, analises: [...banco.analises, nova] });
    return nova;
  },

  async listarPedidos() {
    await simularRede(true);
    const { pedidos } = await lerBanco();
    return [...pedidos].sort(maisRecentePrimeiro((p) => p.criadoEm));
  },

  async buscarPedidoDaAnalise(analiseId) {
    await simularRede(false);
    const { pedidos } = await lerBanco();
    return pedidos.find((p) => p.analiseId === analiseId) ?? null;
  },

  async criarPedido(dados: NovoPedido) {
    await simularRede(false);
    const banco = await lerBanco();
    const novo: Pedido = {
      id: gerarId(),
      ...dados,
      status: 'pendente',
      criadoEm: agoraIso(),
      respondidoEm: null,
    };
    await gravarBanco({ ...banco, pedidos: [...banco.pedidos, novo] });
    return novo;
  },

  async responderPedido(id: string, resposta: RespostaPedido) {
    await simularRede(false);
    const banco = await lerBanco();
    const atual = banco.pedidos.find((p) => p.id === id);
    if (!atual) throw new ErroApp('Este pedido não existe mais.');
    if (atual.status !== 'pendente') throw new ErroApp('Este pedido já foi respondido.');
    const respondido: Pedido = { ...atual, status: resposta, respondidoEm: agoraIso() };
    await gravarBanco({
      ...banco,
      pedidos: banco.pedidos.map((p) => (p.id === id ? respondido : p)),
    });
    return respondido;
  },
};

/**
 * Só para demonstração: cria um pedido como se o idoso tivesse apertado o
 * botão físico (ESP32). No sistema completo quem cria é a API, ao receber a
 * mensagem MQTT do dispositivo.
 */
export function simularBotaoDoDispositivo(): Promise<Pedido> {
  return mockApi.criarPedido({
    analiseId: null,
    idosoNome: 'Dona Maria (dispositivo da sala)',
    descricao: 'Apertou o botão "Confirmar com a família" antes de fazer uma transferência.',
    origem: 'dispositivo',
  });
}
