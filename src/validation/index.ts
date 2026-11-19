// Validações PURAS: recebem os dados do formulário e devolvem os erros.
// Não importam nada de React, não mexem em estado nem em rede.
// Mesma entrada, mesma saída, sempre. Por isso são fáceis de testar.

import type { Origem, Perfil } from '../types';
import { ehOrigem, ehPerfil } from '../types/guards';

/** Para cada campo do formulário, uma mensagem de erro (ou nada, se estiver ok). */
export type ErrosDe<T> = Partial<Record<keyof T, string>>;

/** Uma regra recebe o valor do campo e devolve a mensagem de erro, ou null se passou. */
type Regra<V> = (valor: V) => string | null;

// ---------- Regras reutilizáveis ----------

const obrigatorio =
  (mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length === 0 ? mensagem : null;

const minimo =
  (tamanho: number, mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length > 0 && v.trim().length < tamanho ? mensagem : null;

const maximo =
  (tamanho: number, mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length > tamanho ? mensagem : null;

/** Aplica as regras em ordem e devolve o primeiro erro encontrado. */
function primeiroErro<V>(valor: V, regras: Regra<V>[]): string | undefined {
  for (const regra of regras) {
    const erro = regra(valor);
    if (erro) return erro;
  }
  return undefined;
}

/** Remove os campos sem erro, para `Object.keys(erros).length === 0` significar "tudo certo". */
function semVazios<T>(erros: ErrosDe<T>): ErrosDe<T> {
  return Object.fromEntries(
    Object.entries(erros).filter(([, mensagem]) => mensagem !== undefined),
  ) as ErrosDe<T>;
}

export function semErros<T>(erros: ErrosDe<T>): boolean {
  return Object.keys(erros).length === 0;
}

// ---------- Telefone e PIN ----------

const soDigitos = (v: string) => v.replace(/\D/g, '');

/** Telefone com DDD: 10 dígitos (fixo) ou 11 (celular). */
export const TAMANHOS_TELEFONE = [10, 11] as const;
export const TAMANHO_PIN = 4;

/** PINs fáceis demais de adivinhar. Para bloquear outro, acrescente aqui. */
export const PINS_FRACOS = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '0123', '1212'];

const regraTelefone: Regra<string>[] = [
  obrigatorio('Digite seu telefone com DDD.'),
  (v) =>
    (TAMANHOS_TELEFONE as readonly number[]).includes(soDigitos(v).length)
      ? null
      : 'Confira o número: são o DDD e mais 8 ou 9 dígitos.',
];

const regraPin = (mensagemVazio: string): Regra<string>[] => [
  obrigatorio(mensagemVazio),
  (v) => (/^\d+$/.test(v) && v.length === TAMANHO_PIN ? null : `O PIN tem ${TAMANHO_PIN} números.`),
];

// ---------- Cadastro ----------

export const LIMITES_NOME = { minimo: 2, maximo: 60 } as const;

export interface DadosCadastro {
  nome: string;
  telefone: string;
  pin: string;
  confirmacaoPin: string;
  perfil: Perfil | null;
}

export function validarCadastro(dados: DadosCadastro): ErrosDe<DadosCadastro> {
  return semVazios<DadosCadastro>({
    nome: primeiroErro(dados.nome, [
      obrigatorio('Digite seu nome.'),
      minimo(LIMITES_NOME.minimo, 'O nome está muito curto.'),
      maximo(LIMITES_NOME.maximo, `Use no máximo ${LIMITES_NOME.maximo} letras.`),
    ]),
    telefone: primeiroErro(dados.telefone, regraTelefone),
    pin: primeiroErro(dados.pin, [
      ...regraPin(`Crie um PIN de ${TAMANHO_PIN} números.`),
      (v) => (PINS_FRACOS.includes(v) ? 'Esse PIN é fácil de adivinhar. Escolha outro.' : null),
    ]),
    confirmacaoPin: primeiroErro(dados.confirmacaoPin, [
      obrigatorio('Digite o PIN de novo.'),
      (v) => (v === dados.pin ? null : 'Os dois PINs não são iguais.'),
    ]),
    perfil: ehPerfil(dados.perfil) ? undefined : 'Escolha como você vai usar o app.',
  });
}

// ---------- Entrada (login) ----------

export interface DadosEntrada {
  telefone: string;
  pin: string;
}

export function validarEntrada(dados: DadosEntrada): ErrosDe<DadosEntrada> {
  return semVazios<DadosEntrada>({
    telefone: primeiroErro(dados.telefone, regraTelefone),
    pin: primeiroErro(dados.pin, regraPin('Digite seu PIN.')),
  });
}

// ---------- Nova análise ----------

export const LIMITES_MENSAGEM = { minimo: 10, maximo: 2000 } as const;

export interface DadosNovaAnalise {
  texto: string;
  origem: Origem | null;
}

export function validarNovaAnalise(dados: DadosNovaAnalise): ErrosDe<DadosNovaAnalise> {
  return semVazios<DadosNovaAnalise>({
    texto: primeiroErro(dados.texto, [
      obrigatorio('Cole aqui a mensagem que você recebeu.'),
      minimo(LIMITES_MENSAGEM.minimo, 'A mensagem está muito curta para analisar.'),
      maximo(LIMITES_MENSAGEM.maximo, `Cole no máximo ${LIMITES_MENSAGEM.maximo} caracteres.`),
    ]),
    origem: ehOrigem(dados.origem) ? undefined : 'Escolha por onde a mensagem chegou.',
  });
}
