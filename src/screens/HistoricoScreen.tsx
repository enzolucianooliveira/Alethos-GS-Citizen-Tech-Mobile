// Tela principal do idoso: lista das mensagens já analisadas.
// Mostra os três estados exigidos: carregando, erro e vazio.

import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CartaoAnalise } from '../components/Cartoes';
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../components/Estados';
import { Paragrafo, RodapeUsuario } from '../components/Layout';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { espaco } from '../theme';

export function HistoricoScreen({ navigation }: TelaProps<'Historico'>) {
  const usuario = useUsuarioLogado();

  // useCallback: a função só muda se o usuário mudar, evitando recarregar à toa.
  const carregar = useCallback(() => api.listarAnalises(usuario.id), [usuario.id]);
  const { estado, tentarDeNovo } = useCarregamento(carregar);

  const botaoNova = (
    <View style={styles.topo}>
      <Paragrafo>Olá, {usuario.nome}! Recebeu algo estranho? Analise antes de responder.</Paragrafo>
      <BotaoGrande titulo="Analisar uma mensagem" onPress={() => navigation.navigate('NovaAnalise')} />
    </View>
  );

  if (estado.status === 'carregando') return <EstadoCarregando mensagem="Buscando suas análises..." />;
  if (estado.status === 'erro') return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={tentarDeNovo} />;

  return (
    <FlatList
      data={estado.dados}
      keyExtractor={(analise) => analise.id}
      renderItem={({ item }) => (
        <CartaoAnalise
          analise={item}
          aoTocar={() => navigation.navigate('DetalheAnalise', { id: item.id })}
        />
      )}
      ListHeaderComponent={botaoNova}
      ListEmptyComponent={
        <EstadoVazio
          titulo="Nenhuma análise ainda"
          mensagem="Quando receber uma mensagem suspeita, toque em Analisar uma mensagem e cole o texto."
        />
      }
      ListFooterComponent={<RodapeUsuario />}
      contentContainerStyle={styles.lista}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espaco.medio, flexGrow: 1 },
  topo: { gap: espaco.medio, marginBottom: espaco.grande },
  separador: { height: espaco.medio },
});
