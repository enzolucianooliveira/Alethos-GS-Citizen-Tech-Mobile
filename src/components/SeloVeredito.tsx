import { StyleSheet, Text, View } from 'react-native';

import { aparenciaVeredito, espaco, fonte, raio } from '../theme';
import type { Veredito } from '../types';

export function SeloVeredito({ veredito, grande = false }: { veredito: Veredito; grande?: boolean }) {
  const { rotulo, simbolo, cor, fundo } = aparenciaVeredito[veredito];
  return (
    <View
      style={[styles.selo, { backgroundColor: fundo, borderColor: cor }, grande && styles.seloGrande]}
      accessibilityLabel={`Resultado: ${rotulo}`}
    >
      <Text style={[styles.simbolo, { color: cor }, grande && styles.simboloGrande]}>{simbolo}</Text>
      <Text style={[styles.rotulo, { color: cor }, grande && styles.rotuloGrande]}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.pequeno,
    borderWidth: 2,
    borderRadius: raio,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.xs,
  },
  seloGrande: { alignSelf: 'stretch', paddingVertical: espaco.medio },
  simbolo: { fontSize: fonte.normal, fontWeight: '900' },
  simboloGrande: { fontSize: fonte.titulo },
  rotulo: { fontSize: fonte.pequena, fontWeight: '700' },
  rotuloGrande: { fontSize: fonte.titulo },
});
