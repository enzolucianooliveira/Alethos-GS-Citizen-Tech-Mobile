import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { alturaToque, cores, espaco, familias, fonte, raio } from '../theme';
import { useTema } from '../theme/useTema';
import { Texto } from './Texto';

// Reaproveita as props do TextInput (placeholder, maxLength...) e acrescenta
// rótulo, ajuda e erro. `Omit` tira as que este componente controla.
export interface CampoTextoProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  ajuda?: string;
}

export function CampoTexto({ rotulo, valor, aoMudar, erro, ajuda, multiline, onFocus, onBlur, ...resto }: CampoTextoProps) {
  const tema = useTema();
  const [focado, setFocado] = useState(false);
  const corBorda = erro ? cores.perigo : focado ? tema.principal : cores.bordaForte;

  return (
    <View style={styles.grupo}>
      <Texto variante="destaque">{rotulo}</Texto>
      {ajuda ? <Texto variante="legenda" cor={cores.textoSuave}>{ajuda}</Texto> : null}
      <TextInput
        {...resto}
        value={valor}
        onChangeText={aoMudar}
        multiline={multiline}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
        placeholderTextColor="#8C7A6B"
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.campo,
          multiline && styles.multilinha,
          { borderColor: corBorda },
          focado && { backgroundColor: tema.claro },
        ]}
      />
      {erro ? (
        <Texto variante="legenda" cor={cores.perigo} style={styles.erro} accessibilityLiveRegion="polite">
          ✋ {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.pequeno },
  campo: {
    minHeight: alturaToque,
    borderWidth: 3,
    borderRadius: raio.medio,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.medio,
    fontSize: fonte.normal,
    fontFamily: familias.corpo,
    color: cores.texto,
  },
  multilinha: { minHeight: 170 },
  erro: { fontFamily: familias.corpoNegrito },
});
