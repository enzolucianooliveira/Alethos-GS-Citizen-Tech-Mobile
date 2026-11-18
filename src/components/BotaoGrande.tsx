import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { alturaToque, cores, espaco, fonte, raio } from '../theme';

type Variante = 'primario' | 'secundario' | 'perigo' | 'sucesso';

// Cada variante é só uma combinação de cores. Para criar outra, acrescente aqui.
const ESTILOS_VARIANTE: Record<Variante, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: cores.primario, texto: cores.primarioTexto, borda: cores.primario },
  secundario: { fundo: cores.superficie, texto: cores.primario, borda: cores.primario },
  perigo: { fundo: cores.perigo, texto: cores.primarioTexto, borda: cores.perigo },
  sucesso: { fundo: cores.sucesso, texto: cores.primarioTexto, borda: cores.sucesso },
};

export interface BotaoGrandeProps {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  desabilitado?: boolean;
  carregando?: boolean;
  dica?: string; // lido pelo leitor de tela, explica o que acontece ao tocar
}

export function BotaoGrande({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
  dica,
}: BotaoGrandeProps) {
  const estilo = ESTILOS_VARIANTE[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: estilo.fundo, borderColor: estilo.borda },
        pressed && styles.pressionado,
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={estilo.texto} />
      ) : (
        <Text style={[styles.texto, { color: estilo.texto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: alturaToque,
    borderRadius: raio,
    borderWidth: 2,
    paddingHorizontal: espaco.grande,
    paddingVertical: espaco.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: fonte.normal, fontWeight: '700', textAlign: 'center' },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.5 },
});
