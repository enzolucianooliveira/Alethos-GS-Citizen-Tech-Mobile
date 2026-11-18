// Tela do familiar: lista os pedidos de confirmação, permite responder e
// avisa com notificação local quando chega um pedido novo.

import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AvisoPermissao } from '../components/AvisoPermissao';
import { BotaoGrande } from '../components/BotaoGrande';
import { CartaoPedido } from '../components/Cartoes';
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../components/Estados';
import { Paragrafo, RodapeUsuario } from '../components/Layout';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import { usePermissaoNotificacao } from '../hooks/usePermissaoNotificacao';
import { api, USAR_MOCK } from '../services/api';
import { INTERVALO_CONSULTA_MS } from '../services/config';
import { simularBotaoDoDispositivo } from '../services/mockApi';
import { notificarPedido } from '../services/notificacoes';
import { cores, espaco, fonte } from '../theme';
import type { Pedido, RespostaPedido } from '../types';
import { mensagemDeErro } from '../utils';

const pendentes = (pedidos: Pedido[]) => pedidos.filter((p) => p.status === 'pendente');

export function PedidosScreen() {
  const usuario = useUsuarioLogado();
  const carregar = useCallback(() => api.listarPedidos(), []);
  const { estado, tentarDeNovo, substituirDados } = useCarregamento(carregar);
  const permissao = usePermissaoNotificacao();

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
        const idsPendentes = pendentes(pedidos).map((p) => p.id);
        const conhecidos = vistos.current;

        if (conhecidos === null) {
          // Primeira consulta: o que já existe não é "novo", só marcamos como visto.
          vistos.current = new Set(idsPendentes);
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
      setAviso(`Pedido simulado. Ele aparece aqui em até ${INTERVALO_CONSULTA_MS / 1000} segundos.`);
    } catch (erro: unknown) {
      setAviso(mensagemDeErro(erro));
    }
  }

  if (estado.status === 'carregando') return <EstadoCarregando mensagem="Buscando pedidos..." />;
  if (estado.status === 'erro') return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={tentarDeNovo} />;

  const quantosPendentes = pendentes(estado.dados).length;

  return (
    <FlatList
      data={estado.dados}
      keyExtractor={(pedido) => pedido.id}
      renderItem={({ item }) => (
        <CartaoPedido
          pedido={item}
          respondendo={respondendoId === item.id}
          aoResponder={(resposta) => void responder(item, resposta)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.topo}>
          <Paragrafo>
            Olá, {usuario.nome}.{' '}
            {quantosPendentes > 0
              ? `Há ${quantosPendentes} pedido(s) esperando sua resposta.`
              : 'Nenhum pedido esperando resposta agora.'}
          </Paragrafo>
          <AvisoPermissao
            situacao={permissao.situacao}
            aoPedir={() => void permissao.pedir()}
            aoAbrirConfiguracoes={() => void permissao.abrirConfiguracoes()}
          />
          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <EstadoVazio
          titulo="Nenhum pedido por enquanto"
          mensagem="Quando seu familiar pedir uma confirmação, pelo app ou pelo botão em casa, ela aparece aqui."
        />
      }
      ListFooterComponent={
        <View>
          {USAR_MOCK ? (
            <View style={styles.demo}>
              <Paragrafo suave>Modo demonstração (sem o ESP32 ligado):</Paragrafo>
              <BotaoGrande titulo="Simular botão físico" variante="secundario" onPress={() => void simular()} />
            </View>
          ) : null}
          <RodapeUsuario />
        </View>
      }
      contentContainerStyle={styles.lista}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espaco.medio, flexGrow: 1 },
  topo: { gap: espaco.medio, marginBottom: espaco.grande },
  separador: { height: espaco.medio },
  aviso: { fontSize: fonte.pequena + 1, color: cores.texto, fontWeight: '600' },
  demo: { marginTop: espaco.grande, gap: espaco.pequeno },
});
