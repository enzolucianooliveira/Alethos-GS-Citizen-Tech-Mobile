// Tela do familiar: lista os pedidos de confirmação, permite responder e
// avisa com notificação local quando chega um pedido novo.

import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AvisoPermissao } from '../components/AvisoPermissao';
import { BotaoGrande } from '../components/BotaoGrande';
import { CartaoPedido } from '../components/Cartoes';
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../components/Estados';
import { FamiliaUnida } from '../components/ilustracoes/Cenas';
import { Bloco, Cabecalho, FundoColorido, RodapeUsuario } from '../components/Layout';
import { Texto } from '../components/Texto';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import { usePermissaoNotificacao } from '../hooks/usePermissaoNotificacao';
import { api, USAR_MOCK } from '../services/api';
import { INTERVALO_CONSULTA_MS } from '../services/config';
import { simularBotaoDoDispositivo } from '../services/mockApi';
import { notificarPedido } from '../services/notificacoes';
import { cores, espaco } from '../theme';
import { useTema } from '../theme/useTema';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import type { Pedido, RespostaPedido } from '../types';
import { mensagemDeErro } from '../utils';

const pendentes = (pedidos: Pedido[]) => pedidos.filter((p) => p.status === 'pendente');

export function PedidosScreen() {
  const usuario = useUsuarioLogado();
  const tema = useTema();
  const carregar = useCallback(() => api.listarPedidos(), []);
  const { estado, tentarDeNovo, substituirDados } = useCarregamento(carregar);
  const permissao = usePermissaoNotificacao();
  const { rever } = useTutorialDaTela('pedidos', estado.status === 'sucesso' && permissao.situacao !== 'verificando');

  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Ids dos pedidos pendentes que já vimos. useRef guarda o valor entre as
  // consultas sem redesenhar a tela. null = ainda não fizemos a primeira consulta.
  const vistos = useRef<Set<string> | null>(null);
  // A consulta lê a permissão mais recente sem precisar reiniciar o intervalo.
  const podeNotificar = useRef(false);
  useEffect(() => {
    podeNotificar.current = permissao.situacao === 'concedida';
  }, [permissao.situacao]);

  // Consulta periódica: procura pedidos novos e dispara a notificação local.
  useEffect(() => {
    async function verificar() {
      try {
        const pedidos = await api.listarPedidos();
        const conhecidos = vistos.current;

        if (conhecidos === null) {
          // Primeira consulta: o que já existe não é "novo", só marcamos como visto.
          vistos.current = new Set(pendentes(pedidos).map((p) => p.id));
        } else {
          const novos = pendentes(pedidos).filter((p) => !conhecidos.has(p.id));
          for (const pedido of novos) {
            conhecidos.add(pedido.id);
            if (podeNotificar.current) await notificarPedido(pedido);
          }
        }
        substituirDados(pedidos);
      } catch {
        // Falhou desta vez (ex.: sem internet): tenta de novo na próxima rodada.
      }
    }

    void verificar();
    const intervalo = setInterval(() => void verificar(), INTERVALO_CONSULTA_MS);
    return () => clearInterval(intervalo); // limpeza: sem isso os intervalos se acumulam
  }, [substituirDados]);

  async function responder(pedido: Pedido, resposta: RespostaPedido) {
    if (estado.status !== 'sucesso') return;
    setRespondendoId(pedido.id);
    setAviso(null);
    try {
      const atualizado = await api.responderPedido(pedido.id, resposta);
      substituirDados(estado.dados.map((p) => (p.id === atualizado.id ? atualizado : p)));
    } catch (erro: unknown) {
      setAviso(mensagemDeErro(erro));
    } finally {
      setRespondendoId(null);
    }
  }

  async function simular() {
    setAviso(null);
    try {
      await simularBotaoDoDispositivo();
      setAviso(`Pedido simulado! Ele chega aqui em até ${INTERVALO_CONSULTA_MS / 1000} segundos.`);
    } catch (erro: unknown) {
      setAviso(mensagemDeErro(erro));
    }
  }

  if (estado.status === 'carregando') return <EstadoCarregando mensagem="Buscando pedidos..." />;
  if (estado.status === 'erro') return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={tentarDeNovo} />;

  const quantos = pendentes(estado.dados).length;

  return (
    <FundoColorido>
      <FlatList
        data={estado.dados}
        keyExtractor={(pedido) => pedido.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoPedido
              pedido={item}
              respondendo={respondendoId === item.id}
              aoResponder={(resposta) => void responder(item, resposta)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.topo}>
            <Cabecalho
              semBarra
              titulo={`Olá, ${usuario.nome}!`}
              subtitulo="Você é o protetor da família. Confira cada pedido com calma."
              ilustracao={<FamiliaUnida tamanho={120} />}
              aoPedirDicas={rever}
            />
            <View style={styles.conteudo}>
              <AlvoTutorial id="resumo-pedidos">
                <Bloco destaque={quantos > 0 ? cores.atencao : undefined}>
                  <View style={styles.resumo}>
                    <Texto variante="enorme" cor={quantos > 0 ? cores.atencao : tema.principal}>
                      {quantos}
                    </Texto>
                    <Texto variante="destaque" style={styles.flex}>
                      {quantos === 1 ? 'pedido esperando sua resposta' : 'pedidos esperando sua resposta'}
                    </Texto>
                  </View>
                </Bloco>
              </AlvoTutorial>

              {permissao.situacao !== 'verificando' ? (
                <AlvoTutorial id="aviso-permissao">
                  <AvisoPermissao
                    situacao={permissao.situacao}
                    aoPedir={() => void permissao.pedir()}
                    aoAbrirConfiguracoes={() => void permissao.abrirConfiguracoes()}
                  />
                </AlvoTutorial>
              ) : null}

              {aviso ? <Texto variante="destaque">{aviso}</Texto> : null}

              <AlvoTutorial id="lista-pedidos">
                <Texto variante="subtitulo">Pedidos recebidos</Texto>
              </AlvoTutorial>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nenhum pedido por enquanto"
            mensagem="Quando seu familiar pedir uma confirmação, pelo app ou pelo botão em casa, ela aparece aqui."
            ilustracao={<FamiliaUnida tamanho={130} />}
          />
        }
        ListFooterComponent={
          <View style={styles.conteudo}>
            {USAR_MOCK ? (
              <AlvoTutorial id="botao-simular">
                <Bloco>
                  <Texto variante="legenda" cor={cores.textoSuave}>
                    🧪 Modo demonstração: simula o botão físico (ESP32) sendo apertado em casa.
                  </Texto>
                  <BotaoGrande titulo="Simular botão físico" icone="🔘" variante="secundario" compacto onPress={() => void simular()} />
                </Bloco>
              </AlvoTutorial>
            ) : null}
            <RodapeUsuario />
          </View>
        }
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
      />
    </FundoColorido>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { flexGrow: 1, paddingBottom: espaco.enorme },
  topo: { marginBottom: espaco.medio },
  conteudo: { padding: espaco.medio, gap: espaco.medio },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
  item: { paddingHorizontal: espaco.medio },
  separador: { height: espaco.medio },
});
