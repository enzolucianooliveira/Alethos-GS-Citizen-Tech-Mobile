import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { alturaToque, cores, espaco, fonte, raio } from '../theme';

// Reaproveita as props do TextInput (placeholder, maxLength...) e acrescenta
// rótulo e erro. `Omit` tira as que este componente controla.
export interface CampoTextoProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  ajuda?: string;
}

export function CampoTexto({ rotulo, valor, aoMudar, erro, ajuda, multiline, ...resto }: CampoTextoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      {ajuda ? <Text style={styles.ajuda}>{ajuda}</Text> : null}
      <TextInput
        {...resto}
        value={valor}
        onChangeText={aoMudar}
        multiline={multiline}
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
        placeholderTextColor={cores.textoSuave}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.campo, multiline && styles.multilinha, erro ? styles.campoComErro : null]}
      />
      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.pequeno },
  rotulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  ajuda: { fontSize: fonte.pequena, color: cores.textoSuave },
  campo: {
    minHeight: alturaToque,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: raio,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.pequeno,
    fontSize: fonte.normal,
    color: cores.texto,
  },
  multilinha: { minHeight: 160 },
  campoComErro: { borderColor: cores.perigo },
  erro: { fontSize: fonte.pequena, fontWeight: '600', color: cores.perigo },
});
