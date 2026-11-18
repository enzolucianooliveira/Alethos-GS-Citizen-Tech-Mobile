// Os três estados de qualquer tela que busca dados, em um lugar só.

import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte } from '../theme';
import type { EstadoTela } from '../types';
import { BotaoGrande } from './BotaoGrande';

export function EstadoCarregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={styles.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={cores.primario} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

export function EstadoErro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo: () => void }) {
  return (
    <View style={styles.centro} accessibilityLiveRegion="assertive">
      <Text style={styles.titulo}>Algo deu errado</Text>
      <Text style={styles.texto}>{mensagem}</Text>
      <BotaoGrande titulo="Tentar de novo" onPress={aoTentarDeNovo} />
    </View>
  );
}

export function EstadoVazio({ titulo, mensagem }: { titulo: string; mensagem: string }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

/**
 * Componente genérico: recebe o estado e só chama `children` com os dados
 * quando eles existem. O TypeScript sabe o tipo de `dados` dentro da função.
 */
export function ConteudoComEstado<T>({
  estado,
  aoTentarDeNovo,
  children,
}: {
  estado: EstadoTela<T>;
  aoTentarDeNovo: () => void;
  children: (dados: T) => ReactNode;
}) {
  switch (estado.status) {
    case 'carregando':
      return <EstadoCarregando />;
    case 'erro':
      return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={aoTentarDeNovo} />;
    case 'sucesso':
      return <>{children(estado.dados)}</>;
  }
}

const styles = StyleSheet.create({
  centro: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: espaco.medio,
    padding: espaco.grande,
  },
  titulo: { fontSize: fonte.grande, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: fonte.normal, color: cores.textoSuave, textAlign: 'center', lineHeight: 27 },
});
