// Tela principal do idoso: lista das mensagens já conferidas.
// Mostra os três estados exigidos: carregando, erro e vazio.

import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CartaoAnalise } from '../components/Cartoes';
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../components/Estados';
import { CelularAlerta } from '../components/ilustracoes/Cenas';
import { Cabecalho, FundoColorido, RodapeUsuario } from '../components/Layout';
import { Texto } from '../components/Texto';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { cores, espaco } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';

export function HistoricoScreen({ navigation }: TelaProps<'Historico'>) {
  const usuario = useUsuarioLogado();

  // useCallback: a função só muda se o usuário mudar, evitando recarregar à toa.
  const carregar = useCallback(() => api.listarAnalises(usuario.id), [usuario.id]);
  const { estado, tentarDeNovo } = useCarregamento(carregar);
  const { rever } = useTutorialDaTela('historico', estado.status === 'sucesso');

  if (estado.status === 'carregando') return <EstadoCarregando mensagem="Buscando suas conferências..." />;
  if (estado.status === 'erro') return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={tentarDeNovo} />;

  const total = estado.dados.length;

  return (
    <FundoColorido>
      <FlatList
        data={estado.dados}
        keyExtractor={(analise) => analise.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoAnalise analise={item} aoTocar={() => navigation.navigate('DetalheAnalise', { id: item.id })} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.topo}>
            <Cabecalho
              semBarra
              titulo={`Olá, ${usuario.nome}!`}
              subtitulo="Recebeu algo estranho? Confira antes de responder."
              ilustracao={<CelularAlerta tamanho={112} />}
              aoPedirDicas={rever}
            />
            <View style={styles.acoes}>
              <AlvoTutorial id="botao-analisar">
                <BotaoGrande
                  titulo="Conferir uma mensagem"
                  icone="🔍"
                  onPress={() => navigation.navigate('NovaAnalise')}
                />
              </AlvoTutorial>
              <AlvoTutorial id="lista-analises">
                <Texto variante="subtitulo">
                  Suas conferências {total > 0 ? `(${total})` : ''}
                </Texto>
              </AlvoTutorial>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nada por aqui ainda"
            mensagem="Quando receber uma mensagem suspeita, toque em Conferir uma mensagem e cole o texto."
            ilustracao={<CelularAlerta tamanho={120} />}
          />
        }
        ListFooterComponent={
          <View style={styles.rodape}>
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
  lista: { flexGrow: 1, paddingBottom: espaco.enorme },
  topo: { marginBottom: espaco.medio },
  acoes: { padding: espaco.medio, gap: espaco.grande },
  item: { paddingHorizontal: espaco.medio },
  separador: { height: espaco.medio },
  rodape: { paddingHorizontal: espaco.medio },
});
