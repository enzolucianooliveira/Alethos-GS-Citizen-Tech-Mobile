// Texto padronizado do app. Com fontes personalizadas, o peso (negrito) vem da
// família da fonte, não de `fontWeight`. Por isso as telas usam este componente
// em vez de configurar fonte em todo <Text>.

import { StyleSheet, Text, type TextProps } from 'react-native';

import { cores, familias, fonte } from '../theme';

type Variante = 'enorme' | 'titulo' | 'subtitulo' | 'corpo' | 'destaque' | 'legenda';

const ESTILOS = StyleSheet.create({
  enorme: { fontFamily: familias.titulo, fontSize: fonte.enorme, lineHeight: fonte.enorme * 1.15 },
  titulo: { fontFamily: familias.titulo, fontSize: fonte.titulo, lineHeight: fonte.titulo * 1.2 },
  subtitulo: { fontFamily: familias.tituloMedio, fontSize: fonte.grande, lineHeight: fonte.grande * 1.25 },
  corpo: { fontFamily: familias.corpo, fontSize: fonte.normal, lineHeight: fonte.normal * 1.45 },
  destaque: { fontFamily: familias.corpoNegrito, fontSize: fonte.normal, lineHeight: fonte.normal * 1.4 },
  legenda: { fontFamily: familias.corpo, fontSize: fonte.pequena, lineHeight: fonte.pequena * 1.4 },
});

export interface TextoProps extends TextProps {
  variante?: Variante;
  cor?: string;
  centro?: boolean;
}

export function Texto({ variante = 'corpo', cor = cores.texto, centro = false, style, ...resto }: TextoProps) {
  return (
    <Text
      {...resto}
      accessibilityRole={variante === 'titulo' || variante === 'enorme' ? 'header' : resto.accessibilityRole}
      style={[ESTILOS[variante], { color: cor }, centro && { textAlign: 'center' }, style]}
    />
  );
}
