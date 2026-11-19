// Só na versão web: primeiro aparece o site de apresentação do Alethos.
// Ao tocar em "Experimentar", o app de verdade abre dentro de uma moldura com
// largura de celular, centralizada na tela. No Android e no iOS este
// componente não faz nada e devolve o app exatamente como ele é.

import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { SiteAlethos } from '../site/SiteAlethos';
import { cores, familias, paletas, raio, sombra } from '../theme';

/** Largura máxima do app no navegador (parecida com a de um celular grande). */
const LARGURA_MAXIMA = 440;
/** Altura máxima da moldura em telas grandes. */
const ALTURA_MAXIMA = 900;
/** A partir desta largura de janela, a moldura ganha bordas arredondadas e sombra. */
const LARGURA_TELA_GRANDE = 600;
const MARGEM = 24;

export function MolduraWeb({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [mostrandoApp, setMostrandoApp] = useState(false);

  // No celular de verdade, nada muda.
  if (Platform.OS !== 'web') return <>{children}</>;

  // Na web, quem chega vê primeiro o site.
  if (!mostrandoApp) return <SiteAlethos aoExperimentar={() => setMostrandoApp(true)} />;

  // Num celular aberto pelo navegador, a moldura ocupa a tela toda.
  const telaGrande = width >= LARGURA_TELA_GRANDE;
  const alturaMoldura = telaGrande ? Math.min(height - MARGEM * 2, ALTURA_MAXIMA) : height;

  return (
    <LinearGradient colors={paletas.idoso.gradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fundo}>
      <View style={[styles.moldura, { height: alturaMoldura }, telaGrande && styles.molduraArredondada]}>
        {children}
      </View>
      <Pressable
        onPress={() => setMostrandoApp(false)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.voltar, telaGrande ? styles.voltarGrande : styles.voltarPequeno, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.textoVoltar}>← Voltar ao site</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  moldura: { width: '100%', maxWidth: LARGURA_MAXIMA, overflow: 'hidden' },
  molduraArredondada: {
    borderRadius: raio.grande,
    borderWidth: 6,
    borderColor: '#2A1E17',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
  voltar: {
    position: 'absolute',
    backgroundColor: cores.branco,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...sombra,
  },
  voltarGrande: { top: MARGEM, left: MARGEM },
  voltarPequeno: { bottom: 12, left: 12, opacity: 0.92 },
  textoVoltar: { fontFamily: familias.tituloMedio, fontSize: 17, color: paletas.idoso.escuro },
});
