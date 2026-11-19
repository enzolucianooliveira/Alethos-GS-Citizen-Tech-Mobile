// Site de apresentação do Alethos (só na versão web).
// Não tem as funções do app: mostra o problema, como funciona e convida a
// experimentar. O botão "Experimentar" abre o app de verdade numa moldura.
// Os textos ficam em `conteudo.ts`; os sinais de golpe vêm do próprio analisador.

import { LinearGradient } from 'expo-linear-gradient';
import { useRef, type ComponentRef, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Gui } from '../components/ilustracoes/Gui';
import { SeloVeredito } from '../components/SeloVeredito';
import { Texto } from '../components/Texto';
import { REGRAS } from '../services/analisador';
import { cores, espaco, familias, ICONE_SINAL_PADRAO, ICONES_SINAL, paletas, raio, sombra } from '../theme';
import {
  EQUIPE,
  FONTE_NUMEROS,
  NUMEROS,
  ODS,
  PASSOS,
  PERFIS_SITE,
  SECOES,
  SEGURANCA,
  type IdSecao,
} from './conteudo';

/** A partir desta largura, as seções ficam lado a lado (computador). */
const LARGURA_COMPUTADOR = 900;
const LARGURA_CONTEUDO = 1120;
const ALTURA_BARRA = 72;

const laranja = paletas.idoso;
const roxo = paletas.familiar;

// ---------- Peças reutilizáveis ----------

function Container({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

function TituloSecao({ selo, titulo, texto, claro = false }: { selo: string; titulo: string; texto?: string; claro?: boolean }) {
  return (
    <View style={styles.tituloSecao}>
      <Text style={[styles.selo, claro && styles.seloClaro]}>{selo}</Text>
      <Texto variante="enorme" cor={claro ? cores.branco : cores.texto} centro>
        {titulo}
      </Texto>
      {texto ? (
        <Texto cor={claro ? cores.branco : cores.textoSuave} centro style={styles.textoSecao}>
          {texto}
        </Texto>
      ) : null}
    </View>
  );
}

function BotaoSite({
  titulo,
  aoTocar,
  variante = 'cheio',
}: {
  titulo: string;
  aoTocar: () => void;
  variante?: 'cheio' | 'branco' | 'contorno';
}) {
  const visual = {
    cheio: { fundo: laranja.principal, texto: cores.branco, borda: laranja.escuro },
    branco: { fundo: cores.branco, texto: laranja.principal, borda: cores.branco },
    contorno: { fundo: 'transparent', texto: cores.branco, borda: cores.branco },
  }[variante];
  return (
    <Pressable
      onPress={aoTocar}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.botaoSite,
        { backgroundColor: visual.fundo, borderColor: visual.borda },
        variante !== 'contorno' && sombra,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.textoBotaoSite, { color: visual.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

/** Um celular desenhado com uma tela de exemplo do app. */
function CelularDemo() {
  const sinais = REGRAS.filter((r) => ['numero-novo', 'dinheiro', 'urgencia'].includes(r.id));
  return (
    <View style={styles.celular}>
      <View style={styles.celularEntalhe} />
      <LinearGradient colors={laranja.gradiente} style={styles.celularTopo}>
        <Text style={styles.celularTitulo}>Resultado</Text>
      </LinearGradient>
      <View style={styles.celularTela}>
        <SeloVeredito veredito="golpe" />
        <View style={styles.balaoMensagem}>
          <Texto variante="legenda">“Oi mãe, troquei de número! Me manda um Pix de R$ 500 urgente.”</Texto>
        </View>
        <Texto variante="destaque">Por que parece golpe</Texto>
        {sinais.map((sinal) => (
          <View key={sinal.id} style={styles.sinalMini}>
            <Text style={styles.emojiMini}>{ICONES_SINAL[sinal.id] ?? ICONE_SINAL_PADRAO}</Text>
            <Texto variante="legenda" style={styles.flex}>
              {sinal.titulo}
            </Texto>
          </View>
        ))}
        <View style={styles.botaoMini}>
          <Text style={styles.textoBotaoMini}>📣 Chamar minha família</Text>
        </View>
      </View>
    </View>
  );
}

/** O botão físico (ESP32) que fica em casa. */
function BotaoFisico({ tamanho = 220 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho * 0.8} viewBox="0 0 220 176" accessibilityLabel="Botão físico do Alethos">
      <Path d="M30 150 C10 150 6 170 -10 172" stroke="#5E4B3C" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Rect x={28} y={40} width={170} height={120} rx={26} fill="#FFF7EC" stroke="#2A1E17" strokeWidth={5} />
      <Rect x={28} y={128} width={170} height={32} rx={14} fill="#E9D8C4" />
      <Circle cx={113} cy={92} r={40} fill="#A82C1E" />
      <Circle cx={113} cy={86} r={40} fill="#E8503A" stroke="#7A1E14" strokeWidth={4} />
      <Path d="M96 70 Q104 62 116 62" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Circle cx={180} cy={62} r={7} fill="#FFC93C" />
      <Circle cx={180} cy={86} r={7} fill="#1B7A3D" />
      <Circle cx={180} cy={110} r={7} fill="#C62828" />
      <Path d="M40 24 l6 12 M70 14 l2 14 M100 10 v14" stroke="#FFC93C" strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

// ---------- Página ----------

export function SiteAlethos({ aoExperimentar }: { aoExperimentar: () => void }) {
  const { width } = useWindowDimensions();
  const largo = width >= LARGURA_COMPUTADOR;
  const linha = largo ? styles.linha : styles.coluna;

  // Guarda onde cada seção começa, para os links da barra rolarem até ela.
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
  const posicoes = useRef<Partial<Record<IdSecao, number>>>({});
  const marcar = (id: IdSecao) => (evento: LayoutChangeEvent) => {
    posicoes.current[id] = evento.nativeEvent.layout.y;
  };
  const irPara = (id: IdSecao) => {
    const y = posicoes.current[id];
    if (y !== undefined) rolagem.current?.scrollTo({ y: Math.max(y - ALTURA_BARRA, 0), animated: true });
  };

  return (
    <View style={styles.pagina}>
      {/* barra de navegação fixa */}
      <View style={styles.barra}>
        <Container style={styles.barraConteudo}>
          <Pressable onPress={() => rolagem.current?.scrollTo({ y: 0, animated: true })} style={styles.marca}>
            <Gui tamanho={40} />
            <Text style={styles.marcaTexto}>Alethos</Text>
          </Pressable>
          {largo ? (
            <View style={styles.links}>
              {SECOES.map((secao) => (
                <Pressable key={secao.id} onPress={() => irPara(secao.id)} accessibilityRole="link">
                  <Text style={styles.link}>{secao.rotulo}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <BotaoSite titulo="Experimentar" aoTocar={aoExperimentar} />
        </Container>
      </View>

      <ScrollView ref={rolagem} contentContainerStyle={styles.rolagem}>
        {/* ---------- topo ---------- */}
        <LinearGradient colors={laranja.gradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={[styles.bolha, styles.bolhaA]} />
          <View style={[styles.bolha, styles.bolhaB]} />
          <Container style={[linha, styles.heroConteudo]}>
            <View style={[styles.heroTextos, largo && styles.metade]}>
              <Text style={styles.seloHero}>🛡️ Guardião antigolpe para idosos</Text>
              <Text style={[styles.heroTitulo, { fontSize: largo ? 58 : 40, lineHeight: largo ? 64 : 46 }]}>
                Antes de mandar o Pix, pergunte ao Alethos.
              </Text>
              <Texto cor={cores.branco} style={styles.heroSub}>
                O app que mostra se uma mensagem tem cara de golpe, explica o porquê em palavras simples e chama a
                família antes de qualquer transferência.
              </Texto>
              <View style={styles.botoesHero}>
                <BotaoSite titulo="Experimentar no navegador" variante="branco" aoTocar={aoExperimentar} />
                <BotaoSite titulo="Como funciona" variante="contorno" aoTocar={() => irPara('como-funciona')} />
              </View>
              <Texto variante="legenda" cor={cores.branco}>
                Disponível para Android e iOS pelo Expo Go. Gratuito.
              </Texto>
            </View>
            <View style={[styles.heroImagem, largo && styles.metade]}>
              <CelularDemo />
              <View style={styles.guiFlutuante}>
                <Gui tamanho={largo ? 130 : 96} />
              </View>
            </View>
          </Container>
        </LinearGradient>

        {/* ---------- o problema ---------- */}
        <View onLayout={marcar('problema')} style={styles.secao}>
          <Container>
            <TituloSecao
              selo="O problema"
              titulo="O golpe digital virou rotina"
              texto="Falso parente, falsa central do banco, voz clonada por inteligência artificial. Quem mais sofre é quem tem menos com quem conferir na hora."
            />
            <View style={[linha, styles.grade]}>
              {NUMEROS.map((numero) => (
                <View key={numero.valor} style={[styles.cartao, largo && styles.terco]}>
                  <Text style={styles.numero}>{numero.valor}</Text>
                  <Texto>{numero.texto}</Texto>
                </View>
              ))}
            </View>
            <Texto variante="legenda" cor={cores.textoSuave} centro>
              {FONTE_NUMEROS}
            </Texto>
          </Container>
        </View>

        {/* ---------- como funciona ---------- */}
        <View onLayout={marcar('como-funciona')} style={[styles.secao, styles.secaoBranca]}>
          <Container>
            <TituloSecao selo="Como funciona" titulo="Três passos, nenhum susto" />
            <View style={[linha, styles.grade]}>
              {PASSOS.map((passo, indice) => (
                <View key={passo.titulo} style={[styles.cartao, styles.cartaoPasso, largo && styles.terco]}>
                  <View style={styles.numeroPasso}>
                    <Text style={styles.textoNumeroPasso}>{indice + 1}</Text>
                  </View>
                  <Text style={styles.iconeGrande}>{passo.icone}</Text>
                  <Texto variante="subtitulo">{passo.titulo}</Texto>
                  <Texto cor={cores.textoSuave}>{passo.texto}</Texto>
                </View>
              ))}
            </View>
          </Container>
        </View>

        {/* ---------- sinais de golpe ---------- */}
        <View style={styles.secao}>
          <Container>
            <TituloSecao
              selo="Aprender também protege"
              titulo={`Os ${REGRAS.length} sinais que o Alethos procura`}
              texto="O Alethos não só dá um resultado: ele ensina a reconhecer o golpe. Estes são os sinais que ele procura em cada mensagem."
            />
            <View style={styles.gradeSinais}>
              {REGRAS.map((regra) => (
                <View key={regra.id} style={[styles.cartaoSinal, { width: largo ? '31.5%' : '100%' }]}>
                  <View style={styles.iconeSinal}>
                    <Text style={styles.emoji}>{ICONES_SINAL[regra.id] ?? ICONE_SINAL_PADRAO}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Texto variante="destaque">{regra.titulo}</Texto>
                    <Texto variante="legenda" cor={cores.textoSuave}>
                      {regra.explicacao}
                    </Texto>
                  </View>
                </View>
              ))}
            </View>
          </Container>
        </View>

        {/* ---------- para a família ---------- */}
        <View onLayout={marcar('familia')} style={[styles.secao, styles.secaoBranca]}>
          <Container>
            <TituloSecao
              selo="Dois perfis, um só cuidado"
              titulo="Feito para os avós. Pensado para a família."
            />
            <View style={[linha, styles.grade]}>
              {PERFIS_SITE.map((item) => {
                const paleta = paletas[item.perfil];
                return (
                  <LinearGradient
                    key={item.perfil}
                    colors={paleta.gradiente}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cartaoPerfil, largo && styles.metade]}
                  >
                    <Text style={styles.iconeGrande}>{item.icone}</Text>
                    <Texto variante="titulo" cor={cores.branco}>
                      {item.titulo}
                    </Texto>
                    {item.itens.map((texto) => (
                      <Texto key={texto} cor={cores.branco}>
                        ✓ {texto}
                      </Texto>
                    ))}
                  </LinearGradient>
                );
              })}
            </View>

            <View style={[linha, styles.esp32]}>
              <View style={styles.esp32Imagem}>
                <BotaoFisico tamanho={largo ? 240 : 200} />
              </View>
              <View style={[styles.flex, styles.esp32Textos]}>
                <Text style={[styles.selo, styles.seloClaro]}>Sem celular por perto?</Text>
                <Texto variante="titulo" cor={cores.branco}>
                  Um botão em casa que chama a família
                </Texto>
                <Texto cor={cores.branco}>
                  Antes de qualquer transferência, é só apertar o botão do Alethos. A família recebe o aviso no
                  celular e a luz do botão mostra a resposta: verde para seguir, vermelho para parar.
                </Texto>
              </View>
            </View>
          </Container>
        </View>

        {/* ---------- segurança ---------- */}
        <View onLayout={marcar('seguranca')} style={styles.secao}>
          <Container>
            <TituloSecao selo="Segurança e privacidade" titulo="Um guardião que também se protege" />
            <View style={[linha, styles.grade]}>
              {SEGURANCA.map((item) => (
                <View key={item.titulo} style={[styles.cartao, largo && styles.terco]}>
                  <Text style={styles.iconeGrande}>{item.icone}</Text>
                  <Texto variante="subtitulo">{item.titulo}</Texto>
                  <Texto cor={cores.textoSuave}>{item.texto}</Texto>
                </View>
              ))}
            </View>
          </Container>
        </View>

        {/* ---------- chamada final ---------- */}
        <LinearGradient colors={roxo.gradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chamada}>
          <Container style={styles.chamadaConteudo}>
            <Gui tamanho={110} />
            <TituloSecao
              claro
              selo="Experimente agora"
              titulo="Teste o Alethos direto no navegador"
              texto="Crie uma conta de exemplo, cole uma mensagem suspeita e veja o guardião em ação."
            />
            <BotaoSite titulo="Abrir o app" variante="branco" aoTocar={aoExperimentar} />
          </Container>
        </LinearGradient>

        {/* ---------- rodapé ---------- */}
        <View style={styles.rodape}>
          <Container style={[linha, styles.rodapeConteudo]}>
            <View style={[styles.flex, styles.rodapeColuna]}>
              <View style={styles.marca}>
                <Gui tamanho={40} />
                <Text style={[styles.marcaTexto, { color: cores.branco }]}>Alethos</Text>
              </View>
              <Texto variante="legenda" cor="#E9D8C4">
                Do grego "alethes": verdadeiro. Projeto da Global Solution FIAP 2026, Engenharia de Software.
              </Texto>
              <View style={styles.ods}>
                {ODS.map((ods) => (
                  <Text key={ods} style={styles.chipOds}>
                    {ods}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.rodapeColuna}>
              <Texto variante="destaque" cor={cores.branco}>
                Equipe
              </Texto>
              {EQUIPE.map((nome) => (
                <Texto key={nome} variante="legenda" cor="#E9D8C4">
                  {nome}
                </Texto>
              ))}
            </View>
          </Container>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pagina: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { paddingTop: ALTURA_BARRA },
  container: { width: '100%', maxWidth: LARGURA_CONTEUDO, alignSelf: 'center', paddingHorizontal: espaco.grande },
  linha: { flexDirection: 'row', alignItems: 'center' },
  coluna: { flexDirection: 'column' },
  metade: { flex: 1 },
  terco: { flex: 1 },

  barra: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ALTURA_BARRA,
    zIndex: 10,
    backgroundColor: 'rgba(255, 247, 236, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    justifyContent: 'center',
  },
  barraConteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.medio },
  marca: { flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno },
  marcaTexto: { fontFamily: familias.titulo, fontSize: 28, color: laranja.escuro },
  links: { flexDirection: 'row', gap: espaco.grande },
  link: { fontFamily: familias.corpoNegrito, fontSize: 17, color: cores.texto },

  botaoSite: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: espaco.grande,
    paddingVertical: espaco.medio - 4,
    alignItems: 'center',
  },
  textoBotaoSite: { fontFamily: familias.tituloMedio, fontSize: 19 },

  hero: { overflow: 'hidden', paddingVertical: espaco.enorme * 2 },
  heroConteudo: { gap: espaco.enorme },
  heroTextos: { gap: espaco.grande },
  seloHero: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: cores.branco,
    fontFamily: familias.corpoNegrito,
    fontSize: 16,
    borderRadius: 999,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.pequeno,
  },
  heroTitulo: { fontFamily: familias.titulo, color: cores.branco },
  heroSub: { maxWidth: 560, fontSize: 21, lineHeight: 31 },
  botoesHero: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.medio },
  heroImagem: { alignItems: 'center', justifyContent: 'center' },
  guiFlutuante: { position: 'absolute', left: '6%', bottom: -20 },
  bolha: { position: 'absolute', borderRadius: 999, backgroundColor: cores.branco, opacity: 0.12 },
  bolhaA: { width: 420, height: 420, right: -120, top: -160 },
  bolhaB: { width: 220, height: 220, left: -80, bottom: -100 },

  celular: {
    width: 290,
    height: 560,
    borderRadius: 42,
    borderWidth: 10,
    borderColor: '#2A1E17',
    backgroundColor: cores.fundo,
    overflow: 'hidden',
    ...sombra,
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
  celularEntalhe: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 90,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2A1E17',
    zIndex: 2,
  },
  celularTopo: { paddingTop: 40, paddingBottom: espaco.medio, paddingHorizontal: espaco.medio },
  celularTitulo: { fontFamily: familias.titulo, fontSize: 22, color: cores.branco },
  celularTela: { padding: espaco.medio, gap: espaco.pequeno + 2 },
  balaoMensagem: {
    backgroundColor: cores.superficie,
    borderRadius: raio.pequeno,
    borderLeftWidth: 4,
    borderLeftColor: cores.perigo,
    padding: espaco.pequeno + 2,
  },
  sinalMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.pequeno,
    backgroundColor: cores.superficie,
    borderRadius: raio.pequeno,
    padding: espaco.pequeno,
  },
  emojiMini: { fontSize: 20 },
  botaoMini: {
    marginTop: espaco.xs,
    backgroundColor: laranja.principal,
    borderRadius: raio.pequeno,
    paddingVertical: espaco.pequeno + 4,
    alignItems: 'center',
  },
  textoBotaoMini: { fontFamily: familias.tituloMedio, fontSize: 16, color: cores.branco },

  secao: { paddingVertical: espaco.enorme * 2 },
  secaoBranca: { backgroundColor: cores.superficie },
  tituloSecao: { alignItems: 'center', gap: espaco.medio, marginBottom: espaco.enorme },
  selo: {
    color: laranja.principal,
    fontFamily: familias.corpoNegrito,
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  seloClaro: { color: cores.sol },
  textoSecao: { maxWidth: 720 },
  grade: { gap: espaco.grande, alignItems: 'stretch', marginBottom: espaco.grande },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    padding: espaco.grande,
    gap: espaco.pequeno,
    borderWidth: 2,
    borderColor: cores.borda,
    ...sombra,
  },
  numero: { fontFamily: familias.titulo, fontSize: 56, lineHeight: 62, color: laranja.principal },
  cartaoPasso: { backgroundColor: cores.fundo, paddingTop: espaco.enorme },
  numeroPasso: {
    position: 'absolute',
    top: -18,
    left: espaco.grande,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: laranja.principal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNumeroPasso: { fontFamily: familias.titulo, fontSize: 20, color: cores.branco },
  iconeGrande: { fontSize: 44 },
  gradeSinais: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.medio, justifyContent: 'space-between' },
  cartaoSinal: {
    flexDirection: 'row',
    gap: espaco.medio,
    backgroundColor: cores.superficie,
    borderRadius: raio.medio,
    padding: espaco.medio,
    borderWidth: 2,
    borderColor: cores.borda,
  },
  iconeSinal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: laranja.claro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  cartaoPerfil: { borderRadius: raio.grande, padding: espaco.enorme, gap: espaco.pequeno + 2, ...sombra },
  esp32: {
    backgroundColor: '#2A1E17',
    borderRadius: raio.grande,
    padding: espaco.enorme,
    gap: espaco.enorme,
    marginTop: espaco.grande,
  },
  esp32Imagem: { alignItems: 'center' },
  esp32Textos: { gap: espaco.medio },

  chamada: { paddingVertical: espaco.enorme * 2 },
  chamadaConteudo: { alignItems: 'center' },

  rodape: { backgroundColor: '#2A1E17', paddingVertical: espaco.enorme * 1.5 },
  rodapeConteudo: { gap: espaco.enorme, alignItems: 'flex-start' },
  rodapeColuna: { gap: espaco.pequeno },
  ods: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.pequeno, marginTop: espaco.pequeno },
  chipOds: {
    color: cores.sol,
    fontFamily: familias.corpoNegrito,
    fontSize: 14,
    borderWidth: 1,
    borderColor: cores.sol,
    borderRadius: 999,
    paddingHorizontal: espaco.medio,
    paddingVertical: espaco.xs,
  },
});
