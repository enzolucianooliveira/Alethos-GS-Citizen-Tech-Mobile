// Tutorial guiado, no estilo de jogo: a tela escurece, um recorte ilumina a
// parte explicada e o Gui aparece num balão que aponta para ela. Cada dica
// some sozinha depois de alguns segundos (a barrinha mostra o tempo), ou na
// hora, com um toque.
//
// Como funciona:
// 1. As telas marcam as partes com <AlvoTutorial id="...">.
// 2. Cada alvo se registra aqui, guardando a referência do componente.
// 3. Ao mostrar um passo, medimos onde o alvo está na tela (measureInWindow)
//    e desenhamos o recorte e o balão nessa posição.

import * as Speech from 'expo-speech';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Gui } from '../components/ilustracoes/Gui';
import { Texto } from '../components/Texto';
import { marcarTutorialVisto } from '../storage/tutorialStorage';
import { cores, espaco, familias, fonte, raio, sombra } from '../theme';
import { useTema } from '../theme/useTema';
import type { ChaveTutorial, PassoTutorial } from './passos';

/** Quanto tempo cada dica fica na tela antes de passar sozinha. */
export const DURACAO_PASSO_MS = 7000;
const MARGEM_RECORTE = 8;
const ALTURA_BALAO_ESTIMADA = 250;

type NoView = ComponentRef<typeof View>;

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

interface Sessao {
  chave: ChaveTutorial;
  passos: PassoTutorial[];
  indice: number;
}

interface ValorTutorial {
  registrarAlvo: (id: string, no: NoView | null) => void;
  iniciar: (chave: ChaveTutorial, passos: PassoTutorial[]) => void;
  parar: (chave: ChaveTutorial) => void;
}

const TutorialContext = createContext<ValorTutorial | null>(null);

export function useTutorial(): ValorTutorial {
  const valor = useContext(TutorialContext);
  if (!valor) throw new Error('useTutorial precisa estar dentro de <TutorialProvider>.');
  return valor;
}

/** Desenha o contorno de um retângulo com cantos arredondados (para o recorte). */
function caminhoRetangulo({ x, y, largura, altura }: Retangulo, r: number): string {
  return `M${x + r} ${y} H${x + largura - r} Q${x + largura} ${y} ${x + largura} ${y + r} V${y + altura - r} Q${x + largura} ${y + altura} ${x + largura - r} ${y + altura} H${x + r} Q${x} ${y + altura} ${x} ${y + altura - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(Math.max(valor, minimo), maximo);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tema = useTema();
  const alvos = useRef(new Map<string, NoView>());
  const raiz = useRef<NoView | null>(null);
  const origemRaiz = useRef({ x: 0, y: 0 });

  const [tela, setTela] = useState({ largura: 0, altura: 0 });
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [retangulo, setRetangulo] = useState<Retangulo | null>(null);

  const entrada = useRef(new Animated.Value(0)).current; // 0 = escondido, 1 = visível
  const progresso = useRef(new Animated.Value(0)).current; // barrinha de tempo
  const pulso = useRef(new Animated.Value(0)).current; // anel piscando no alvo

  const registrarAlvo = useCallback((id: string, no: NoView | null) => {
    if (no) alvos.current.set(id, no);
    else alvos.current.delete(id);
  }, []);

  const iniciar = useCallback((chave: ChaveTutorial, passos: PassoTutorial[]) => {
    // Passos opcionais cujo alvo não está na tela agora são deixados de fora.
    const visiveis = passos.filter((p) => !p.opcional || (p.alvo !== undefined && alvos.current.has(p.alvo)));
    if (visiveis.length > 0) setSessao({ chave, passos: visiveis, indice: 0 });
  }, []);

  const terminar = useCallback(() => {
    Speech.stop();
    Animated.timing(entrada, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setSessao((atual) => {
        if (atual) void marcarTutorialVisto(atual.chave);
        return null;
      });
      setRetangulo(null);
    });
  }, [entrada]);

  const parar = useCallback((chave: ChaveTutorial) => {
    setSessao((atual) => (atual?.chave === chave ? null : atual));
  }, []);

  const avancar = useCallback(() => {
    Speech.stop();
    if (!sessao) return;
    if (sessao.indice >= sessao.passos.length - 1) {
      terminar();
      return;
    }
    // A dica atual some rapidinho e a próxima aparece no novo lugar.
    Animated.timing(entrada, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setSessao((atual) => (atual ? { ...atual, indice: atual.indice + 1 } : atual));
    });
  }, [sessao, entrada, terminar]);

  const passo = sessao ? sessao.passos[sessao.indice] : undefined;

  // A cada passo: mede o alvo, mostra o balão e começa a contar o tempo.
  useEffect(() => {
    if (!passo) return;
    let cancelado = false;

    const mostrar = (ret: Retangulo | null) => {
      if (cancelado) return;
      setRetangulo(ret);
      entrada.setValue(0);
      progresso.setValue(0);
      Animated.spring(entrada, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
      Animated.timing(progresso, {
        toValue: 1,
        duration: DURACAO_PASSO_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !cancelado) avancar();
      });
    };

    const no = passo.alvo ? alvos.current.get(passo.alvo) : undefined;
    if (!no) {
      mostrar(null);
    } else {
      no.measureInWindow((x, y, largura, altura) => {
        const ret = { x: x - origemRaiz.current.x, y: y - origemRaiz.current.y, largura, altura };
        const visivel = largura > 0 && altura > 0 && ret.y >= 0 && ret.y + altura <= tela.altura;
        mostrar(visivel ? ret : null); // fora da tela: o balão aparece no centro
      });
    }

    return () => {
      cancelado = true;
      progresso.stopAnimation();
    };
    // `avancar` muda junto com a sessão; o passo já cobre essa mudança.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, tela.altura]);

  // Anel pulsando em volta do alvo enquanto o tutorial está aberto.
  useEffect(() => {
    if (!sessao) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sessao, pulso]);

  const aoMedirRaiz = useCallback((evento: LayoutChangeEvent) => {
    const { width, height } = evento.nativeEvent.layout;
    setTela({ largura: width, altura: height });
    raiz.current?.measureInWindow((x, y) => {
      origemRaiz.current = { x, y };
    });
  }, []);

  const valor = useMemo(() => ({ registrarAlvo, iniciar, parar }), [registrarAlvo, iniciar, parar]);

  // ---------- Posição do balão ----------
  const recorte = retangulo
    ? {
        x: retangulo.x - MARGEM_RECORTE,
        y: retangulo.y - MARGEM_RECORTE,
        largura: retangulo.largura + MARGEM_RECORTE * 2,
        altura: retangulo.altura + MARGEM_RECORTE * 2,
      }
    : null;
  const embaixo = recorte ? tela.altura - (recorte.y + recorte.altura) > ALTURA_BALAO_ESTIMADA : true;
  const posicaoBalao = recorte
    ? embaixo
      ? { top: recorte.y + recorte.altura + 18 }
      : { bottom: tela.altura - recorte.y + 18 }
    : { top: tela.altura * 0.22 };
  const setaX = recorte ? limitar(recorte.x + recorte.largura / 2 - espaco.medio - 12, 24, tela.largura - 80) : 0;

  const escala = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const largura = progresso.interpolate({ inputRange: [0, 1], outputRange: ['100%', '0%'] });
  const brilhoAnel = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const ultimo = sessao ? sessao.indice === sessao.passos.length - 1 : false;

  return (
    <TutorialContext.Provider value={valor}>
      <View ref={raiz} style={styles.flex} onLayout={aoMedirRaiz} collapsable={false}>
        {children}

        {sessao && passo ? (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: entrada }]} accessibilityViewIsModal>
            {/* véu escuro com um "buraco" sobre o alvo */}
            <Pressable style={StyleSheet.absoluteFill} onPress={avancar} accessibilityLabel="Próxima dica">
              <Svg width={tela.largura} height={tela.altura}>
                <Path
                  d={`M0 0 H${tela.largura} V${tela.altura} H0 Z ${recorte ? caminhoRetangulo(recorte, raio.medio) : ''}`}
                  fill={cores.veu}
                  fillRule="evenodd"
                />
              </Svg>
            </Pressable>

            {recorte ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.anel,
                  { left: recorte.x, top: recorte.y, width: recorte.largura, height: recorte.altura, opacity: brilhoAnel },
                ]}
              />
            ) : null}

            <Animated.View
              style={[styles.balao, posicaoBalao, { transform: [{ scale: escala }] }]}
              accessibilityLiveRegion="polite"
            >
              {recorte ? (
                <View style={[styles.seta, embaixo ? styles.setaCima : styles.setaBaixo, { left: setaX }]} />
              ) : null}

              <View style={styles.linha}>
                <Gui tamanho={recorte ? 64 : 96} humor={passo.humor} />
                <View style={styles.flex}>
                  <Texto variante="legenda" cor={tema.principal} style={styles.contador}>
                    Dica {sessao.indice + 1} de {sessao.passos.length}
                  </Texto>
                  <Texto variante="subtitulo">{passo.titulo}</Texto>
                </View>
              </View>
              <Texto>{passo.texto}</Texto>

              <View style={styles.trilho}>
                <Animated.View style={[styles.barra, { width: largura, backgroundColor: tema.principal }]} />
              </View>

              <View style={styles.acoes}>
                <Pressable onPress={terminar} accessibilityRole="button" hitSlop={12}>
                  <Text style={styles.pular}>Pular</Text>
                </Pressable>
                <Pressable
                  onPress={() => Speech.speak(`${passo.titulo}. ${passo.texto}`, { language: 'pt-BR', rate: 0.9 })}
                  accessibilityRole="button"
                  accessibilityLabel="Ouvir esta dica"
                  hitSlop={12}
                >
                  <Text style={styles.ouvir}>🔊</Text>
                </Pressable>
                <Pressable
                  onPress={avancar}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.proximo, { backgroundColor: tema.principal }, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.textoProximo}>{ultimo ? 'Entendi!' : 'Próximo ›'}</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </TutorialContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  anel: { position: 'absolute', borderRadius: raio.medio, borderWidth: 4, borderColor: cores.sol },
  balao: {
    position: 'absolute',
    left: espaco.medio,
    right: espaco.medio,
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    padding: espaco.medio,
    gap: espaco.pequeno,
    ...sombra,
  },
  seta: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: cores.superficie,
    transform: [{ rotate: '45deg' }],
  },
  setaCima: { top: -10 },
  setaBaixo: { bottom: -10 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
  contador: { fontFamily: familias.corpoNegrito },
  trilho: { height: 6, borderRadius: 3, backgroundColor: cores.borda, overflow: 'hidden', marginTop: espaco.xs },
  barra: { height: 6, borderRadius: 3 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio, marginTop: espaco.xs },
  pular: { fontFamily: familias.corpoNegrito, fontSize: fonte.normal, color: cores.textoSuave, textDecorationLine: 'underline' },
  ouvir: { fontSize: 28 },
  proximo: {
    marginLeft: 'auto',
    borderRadius: raio.grande,
    paddingHorizontal: espaco.grande,
    paddingVertical: espaco.pequeno + 2,
  },
  textoProximo: { fontFamily: familias.tituloMedio, fontSize: fonte.normal, color: cores.branco },
});
