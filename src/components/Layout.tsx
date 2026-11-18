// Peças de layout reaproveitadas pelas telas.

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useUsuario } from '../contexts/UsuarioContext';
import { cores, espaco, fonte } from '../theme';
import { BotaoGrande } from './BotaoGrande';

/** Tela com rolagem que não deixa o teclado cobrir os campos. */
export function TelaRolavel({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Mostra quem está usando o app e o botão de sair. */
export function RodapeUsuario() {
  const { usuario, sair } = useUsuario();
  if (!usuario) return null;
  return (
    <View style={styles.rodape}>
      <Text style={styles.textoRodape}>Você entrou como {usuario.nome}.</Text>
      <BotaoGrande
        titulo="Sair"
        variante="secundario"
        onPress={() => void sair()}
        dica="Esquece seu nome neste celular e volta para a tela inicial"
      />
    </View>
  );
}

export function Paragrafo({ children, suave = false }: { children: ReactNode; suave?: boolean }) {
  return <Text style={[styles.paragrafo, suave && styles.suave]}>{children}</Text>;
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return (
    <Text style={styles.subtitulo} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: { flexGrow: 1, padding: espaco.medio, gap: espaco.grande, paddingBottom: espaco.enorme },
  rodape: {
    marginTop: espaco.grande,
    paddingTop: espaco.medio,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: espaco.pequeno,
  },
  textoRodape: { fontSize: fonte.pequena, color: cores.textoSuave, textAlign: 'center' },
  paragrafo: { fontSize: fonte.normal, color: cores.texto, lineHeight: 28 },
  suave: { color: cores.textoSuave },
  subtitulo: { fontSize: fonte.grande, fontWeight: '700', color: cores.texto },
});
