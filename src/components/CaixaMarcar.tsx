import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco } from '../theme';
import { useTema } from '../theme/useTema';
import { Texto } from './Texto';

interface Props {
  rotulo: string;
  ajuda?: string;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
}

/** Caixa de marcar grande, fácil de tocar. */
export function CaixaMarcar({ rotulo, ajuda, marcado, aoMudar }: Props) {
  const tema = useTema();
  return (
    <Pressable
      onPress={() => aoMudar(!marcado)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
      accessibilityLabel={rotulo}
      accessibilityHint={ajuda}
      style={styles.linha}
      hitSlop={8}
    >
      <View
        style={[
          styles.caixa,
          { borderColor: marcado ? tema.principal : cores.bordaForte },
          marcado && { backgroundColor: tema.principal },
        ]}
      >
        {marcado ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.textos}>
        <Texto variante="destaque">{rotulo}</Texto>
        {ajuda ? (
          <Texto variante="legenda" cor={cores.textoSuave}>
            {ajuda}
          </Texto>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
  caixa: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: cores.branco, fontSize: 22, fontWeight: '900' },
  textos: { flex: 1 },
});
