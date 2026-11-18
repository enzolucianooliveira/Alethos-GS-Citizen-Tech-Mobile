import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { alturaToque, cores, espaco, familias, fonte, raio, sombra, type PaletaPerfil } from '../theme';
import { useTema } from '../theme/useTema';

type Variante = 'primario' | 'secundario' | 'perigo' | 'sucesso' | 'claro';

// Cada variante é só uma combinação de cores. As duas primeiras seguem a cor do perfil.
function coresDaVariante(variante: Variante, tema: PaletaPerfil) {
  const mapa: Record<Variante, { fundo: string; texto: string; borda: string }> = {
    primario: { fundo: tema.principal, texto: cores.branco, borda: tema.escuro },
    secundario: { fundo: cores.superficie, texto: tema.principal, borda: tema.principal },
    perigo: { fundo: cores.perigo, texto: cores.branco, borda: '#8E1B1B' },
    sucesso: { fundo: cores.sucesso, texto: cores.branco, borda: '#11542A' },
    claro: { fundo: tema.claro, texto: tema.escuro, borda: tema.claro },
  };
  return mapa[variante];
}

export interface BotaoGrandeProps {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: string; // emoji mostrado antes do texto
  desabilitado?: boolean;
  carregando?: boolean;
  dica?: string; // lido pelo leitor de tela: o que acontece ao tocar
  compacto?: boolean;
}

export function BotaoGrande({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  desabilitado = false,
  carregando = false,
  dica,
  compacto = false,
}: BotaoGrandeProps) {
  const tema = useTema();
  const estilo = coresDaVariante(variante, tema);
  const inativo = desabilitado || carregando;
  const solido = variante !== 'secundario' && variante !== 'claro';

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
        compacto && styles.compacto,
        { backgroundColor: estilo.fundo, borderColor: estilo.borda },
        solido && sombra,
        pressed && styles.pressionado,
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={estilo.texto} />
      ) : (
        <View style={styles.linha}>
          {icone ? <Text style={styles.icone}>{icone}</Text> : null}
          <Text style={[styles.texto, compacto && styles.textoCompacto, { color: estilo.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: alturaToque,
    borderRadius: raio.medio,
    borderWidth: 2,
    borderBottomWidth: 5, // "degrau" embaixo: o botão parece apertável
    paddingHorizontal: espaco.grande,
    paddingVertical: espaco.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compacto: { minHeight: 48, paddingHorizontal: espaco.medio, borderBottomWidth: 3 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno },
  icone: { fontSize: fonte.grande },
  texto: { fontFamily: familias.tituloMedio, fontSize: fonte.grande, textAlign: 'center' },
  textoCompacto: { fontSize: fonte.normal },
  pressionado: { transform: [{ translateY: 2 }], opacity: 0.9 },
  inativo: { opacity: 0.5 },
});
