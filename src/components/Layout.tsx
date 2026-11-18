// Peças de layout reaproveitadas pelas telas.

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUsuario } from '../contexts/UsuarioContext';
import { cores, espaco, familias, fonte, raio, sombra } from '../theme';
import { useTema } from '../theme/useTema';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { BotaoGrande } from './BotaoGrande';
import { Texto } from './Texto';

interface CabecalhoProps {
  titulo: string;
  subtitulo?: string;
  ilustracao?: ReactNode;
  /** Quando existe, mostra o botão "Dicas" que reabre o tutorial da tela. */
  aoPedirDicas?: () => void;
  /** true quando a tela não tem a barra de navegação em cima (respeita o entalhe do celular). */
  semBarra?: boolean;
  children?: ReactNode;
}

/** Faixa colorida do topo, com a cor do perfil, título grande e ilustração. */
export function Cabecalho({ titulo, subtitulo, ilustracao, aoPedirDicas, semBarra = false, children }: CabecalhoProps) {
  const tema = useTema();
  const { top } = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={tema.gradiente}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cabecalho, { paddingTop: (semBarra ? top : 0) + espaco.grande }]}
    >
      {/* círculos decorativos */}
      <View style={[styles.bolha, styles.bolhaGrande]} />
      <View style={[styles.bolha, styles.bolhaPequena]} />

      {aoPedirDicas ? (
        <AlvoTutorial id="botao-dicas" style={styles.dicasAlvo}>
          <Pressable
            onPress={aoPedirDicas}
            accessibilityRole="button"
            accessibilityLabel="Ver dicas desta tela"
            style={({ pressed }) => [styles.dicas, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.textoDicas, { color: tema.escuro }]}>💡 Dicas</Text>
          </Pressable>
        </AlvoTutorial>
      ) : null}

      <View style={styles.linha}>
        <View style={styles.textos}>
          <Texto variante="enorme" cor={cores.branco}>
            {titulo}
          </Texto>
          {subtitulo ? <Texto cor={cores.branco}>{subtitulo}</Texto> : null}
        </View>
        {ilustracao ? <View style={styles.ilustracao}>{ilustracao}</View> : null}
      </View>
      {children}
    </LinearGradient>
  );
}

// Bolhas decorativas do fundo. Para mudar o desenho, basta editar este array.
// `cor`: 'branco', 'sol' ou 'perfil' (a cor do perfil de quem está usando).
const BOLHAS: {
  tamanho: number;
  posicao: { top?: `${number}%`; bottom?: `${number}%`; left?: number | `${number}%`; right?: number | `${number}%` };
  cor: 'branco' | 'sol' | 'perfil';
  opacidade: number;
}[] = [
  { tamanho: 260, posicao: { top: '12%', left: -110 }, cor: 'branco', opacidade: 0.35 },
  { tamanho: 180, posicao: { top: '42%', right: -70 }, cor: 'perfil', opacidade: 0.14 },
  { tamanho: 120, posicao: { bottom: '18%', left: '8%' }, cor: 'sol', opacidade: 0.35 },
  { tamanho: 300, posicao: { bottom: '-12%', right: -120 }, cor: 'branco', opacidade: 0.3 },
  { tamanho: 46, posicao: { top: '30%', right: '18%' }, cor: 'sol', opacidade: 0.5 },
];

/** Fundo colorido das telas: degradê na cor do perfil e bolhas decorativas. */
export function FundoColorido({ children }: { children: ReactNode }) {
  const tema = useTema();
  const corDa = (cor: (typeof BOLHAS)[number]['cor']) =>
    cor === 'branco' ? cores.branco : cor === 'sol' ? cores.sol : tema.bolha;

  return (
    <View style={styles.flex}>
      <LinearGradient colors={tema.fundo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {BOLHAS.map((bolha, indice) => (
          <View
            key={indice}
            style={[
              styles.bolha,
              bolha.posicao,
              { width: bolha.tamanho, height: bolha.tamanho, backgroundColor: corDa(bolha.cor), opacity: bolha.opacidade },
            ]}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

/** Tela com rolagem que não deixa o teclado cobrir os campos. */
export function TelaRolavel({ topo, children }: { topo?: ReactNode; children: ReactNode }) {
  return (
    <FundoColorido>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.rolagem} keyboardShouldPersistTaps="handled">
          {topo}
          <View style={styles.conteudo}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FundoColorido>
  );
}

/** Cartão branco com sombra, para agrupar um assunto. */
export function Bloco({ children, destaque }: { children: ReactNode; destaque?: string }) {
  return <View style={[styles.bloco, destaque ? { borderColor: destaque, borderWidth: 3 } : null]}>{children}</View>;
}

/** Mostra quem está usando o app e o botão de sair. */
export function RodapeUsuario() {
  const { usuario, sair } = useUsuario();
  if (!usuario) return null;
  return (
    <View style={styles.rodape}>
      <Texto variante="legenda" cor={cores.textoSuave} centro>
        Você entrou como {usuario.nome}.
      </Texto>
      <BotaoGrande
        titulo="Sair"
        icone="🚪"
        variante="secundario"
        compacto
        onPress={() => void sair()}
        dica="Esquece seu nome neste celular e volta para a tela inicial"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rolagem: { flexGrow: 1, paddingBottom: espaco.enorme },
  conteudo: { padding: espaco.medio, gap: espaco.grande },
  cabecalho: {
    paddingHorizontal: espaco.medio,
    paddingBottom: espaco.grande,
    borderBottomLeftRadius: raio.grande,
    borderBottomRightRadius: raio.grande,
    overflow: 'hidden',
    gap: espaco.medio,
  },
  bolha: { position: 'absolute', borderRadius: 999, backgroundColor: cores.branco, opacity: 0.12 },
  bolhaGrande: { width: 220, height: 220, right: -60, top: -70 },
  bolhaPequena: { width: 90, height: 90, left: -30, bottom: -30 },
  dicasAlvo: { alignSelf: 'flex-end' },
  dicas: {
    backgroundColor: cores.branco,
    borderRadius: raio.grande,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.pequeno,
    ...sombra,
  },
  textoDicas: { fontFamily: familias.tituloMedio, fontSize: fonte.normal },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno },
  textos: { flex: 1, gap: espaco.xs },
  ilustracao: { marginRight: -espaco.pequeno },
  bloco: {
    backgroundColor: cores.superficie,
    borderRadius: raio.medio,
    borderWidth: 2,
    borderColor: cores.borda,
    padding: espaco.medio,
    gap: espaco.medio,
    ...sombra,
  },
  rodape: {
    marginTop: espaco.grande,
    paddingTop: espaco.medio,
    borderTopWidth: 2,
    borderTopColor: cores.borda,
    borderStyle: 'dashed',
    gap: espaco.pequeno,
  },
});
