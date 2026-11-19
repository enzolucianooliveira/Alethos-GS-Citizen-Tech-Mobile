// Resultado de uma conferência: veredito, conselho, pedido de confirmação para
// a família e os sinais explicados. Recebe só o `id` pela rota (tipado).

import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { ConteudoComEstado } from '../components/Estados';
import { FamiliaUnida } from '../components/ilustracoes/Cenas';
import { Bloco, TelaRolavel } from '../components/Layout';
import { CartaoVeredito } from '../components/SeloVeredito';
import { Texto } from '../components/Texto';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { INTERVALO_CONSULTA_MS } from '../services/config';
import { aparenciaVeredito, cores, espaco, ICONE_SINAL_PADRAO, ICONES_SINAL, raio } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import type { Analise, Pedido, StatusPedido } from '../types';
import { agoraIso, formatarDataHora, formatarHora, mensagemDeErro, resumir } from '../utils';

interface Detalhe {
  analise: Analise;
  pedido: Pedido | null;
}

const TEXTO_STATUS: Record<StatusPedido, { icone: string; titulo: string; texto: string; cor: string; fundo: string }> = {
  pendente: {
    icone: '⏳',
    titulo: 'Esperando sua família',
    texto: 'Não faça nada até receber a resposta. Eu confiro sozinho e aviso aqui quando ela chegar.',
    cor: cores.atencao,
    fundo: cores.atencaoFundo,
  },
  aprovado: {
    icone: '✅',
    titulo: 'Sua família conferiu: pode seguir',
    texto: 'Mesmo assim, nunca passe senha ou código para ninguém.',
    cor: cores.sucesso,
    fundo: cores.sucessoFundo,
  },
  negado: {
    icone: '🛑',
    titulo: 'Sua família pediu: NÃO siga',
    texto: 'Não responda, não clique e não transfira. Se quiser, bloqueie o número.',
    cor: cores.perigo,
    fundo: cores.perigoFundo,
  },
};

/** Monta o texto que o celular lê em voz alta. */
function textoParaOuvir(analise: Analise): string {
  const { rotulo, conselho } = aparenciaVeredito[analise.veredito];
  const sinais = analise.sinais.map((s) => s.titulo).join('. ');
  return `${rotulo}. ${conselho} ${sinais ? `Sinais encontrados: ${sinais}.` : ''}`;
}

export function DetalheAnaliseScreen({ route }: TelaProps<'DetalheAnalise'>) {
  const { id } = route.params; // tipado: o TypeScript sabe que é string
  const usuario = useUsuarioLogado();

  const carregar = useCallback(async (): Promise<Detalhe> => {
    // As duas buscas são independentes, então rodam ao mesmo tempo.
    const [analise, pedido] = await Promise.all([api.buscarAnalise(id), api.buscarPedidoDaAnalise(id)]);
    return { analise, pedido };
  }, [id]);
  const { estado, tentarDeNovo, recarregar, substituirDados } = useCarregamento(carregar);
  useTutorialDaTela('detalhe', estado.status === 'sucesso');

  const [pedindo, setPedindo] = useState(false);
  const [erroPedido, setErroPedido] = useState<string | null>(null);
  const [falando, setFalando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [ultimaVerificacao, setUltimaVerificacao] = useState<string | null>(null);

  const aguardando = estado.status === 'sucesso' && estado.dados.pedido?.status === 'pendente';

  // Para a voz ao sair da tela.
  useEffect(() => () => void Speech.stop(), []);

  /** Busca a resposta da família de novo e registra o horário da verificação. */
  const verificarResposta = useCallback(async () => {
    await recarregar();
    setUltimaVerificacao(agoraIso());
  }, [recarregar]);

  // Enquanto o pedido está pendente, confere sozinho de tempos em tempos.
  // Assim a pessoa não precisa ficar tocando no botão: a resposta aparece sozinha.
  useEffect(() => {
    if (!aguardando) return;
    const intervalo = setInterval(() => void verificarResposta(), INTERVALO_CONSULTA_MS);
    return () => clearInterval(intervalo);
  }, [aguardando, verificarResposta]);

  async function verificarAgora() {
    setVerificando(true);
    await verificarResposta();
    setVerificando(false);
  }

  function ouvir(analise: Analise) {
    if (falando) {
      void Speech.stop();
      setFalando(false);
      return;
    }
    setFalando(true);
    Speech.speak(textoParaOuvir(analise), {
      language: 'pt-BR',
      rate: 0.9,
      onDone: () => setFalando(false),
      onStopped: () => setFalando(false),
      onError: () => setFalando(false),
    });
  }

  async function pedirConfirmacao(analise: Analise) {
    setPedindo(true);
    setErroPedido(null);
    try {
      const pedido = await api.criarPedido({
        analiseId: analise.id,
        idosoNome: usuario.nome,
        descricao: `${aparenciaVeredito[analise.veredito].rotulo}: "${resumir(analise.texto, 80)}"`,
        origem: 'app',
      });
      substituirDados({ analise, pedido });
    } catch (erro: unknown) {
      setErroPedido(mensagemDeErro(erro));
    } finally {
      setPedindo(false);
    }
  }

  return (
    <ConteudoComEstado estado={estado} aoTentarDeNovo={tentarDeNovo}>
      {({ analise, pedido }) => (
        <TelaRolavel>
          <AlvoTutorial id="cartao-veredito">
            <CartaoVeredito veredito={analise.veredito} />
          </AlvoTutorial>

          <Bloco>
            <Texto>{aparenciaVeredito[analise.veredito].conselho}</Texto>
            <AlvoTutorial id="botao-ouvir">
              <BotaoGrande
                titulo={falando ? 'Parar de ler' : 'Ouvir em voz alta'}
                icone={falando ? '⏹️' : '🔊'}
                variante="claro"
                compacto
                onPress={() => ouvir(analise)}
              />
            </AlvoTutorial>
          </Bloco>

          {pedido ? (
            <View
              style={[styles.status, { borderColor: TEXTO_STATUS[pedido.status].cor, backgroundColor: TEXTO_STATUS[pedido.status].fundo }]}
              accessibilityLiveRegion="polite"
            >
              <Texto variante="subtitulo" cor={TEXTO_STATUS[pedido.status].cor}>
                {TEXTO_STATUS[pedido.status].icone} {TEXTO_STATUS[pedido.status].titulo}
              </Texto>
              <Texto>{TEXTO_STATUS[pedido.status].texto}</Texto>
              {pedido.status === 'pendente' ? (
                <>
                  <View style={styles.esperando}>
                    <ActivityIndicator color={cores.atencao} />
                    <Texto variante="legenda" style={styles.flex}>
                      Pedido enviado às {formatarHora(pedido.criadoEm)}. Conferindo a cada {INTERVALO_CONSULTA_MS / 1000} segundos...
                    </Texto>
                  </View>
                  {ultimaVerificacao ? (
                    <View style={styles.semResposta} accessibilityLiveRegion="polite">
                      <Texto variante="destaque" cor={cores.atencao}>
                        Ainda sem resposta da sua família.
                      </Texto>
                      <Texto variante="legenda">Última verificação às {formatarHora(ultimaVerificacao)}.</Texto>
                    </View>
                  ) : null}
                  <BotaoGrande
                    titulo="Ver resposta agora"
                    icone="🔄"
                    variante="secundario"
                    compacto
                    carregando={verificando}
                    onPress={() => void verificarAgora()}
                  />
                  <Texto variante="legenda" cor={cores.textoSuave}>
                    📞 Demorando? Ligue para sua família e peça para abrir o Alethos e responder.
                  </Texto>
                </>
              ) : null}
            </View>
          ) : (
            <AlvoTutorial id="pedir-familia">
              <Bloco>
                <View style={styles.linha}>
                  <FamiliaUnida tamanho={96} />
                  <Texto style={styles.flex}>Vai mandar dinheiro ou passar algum dado? Peça para a família conferir antes.</Texto>
                </View>
                <BotaoGrande
                  titulo="Chamar minha família"
                  icone="📣"
                  onPress={() => void pedirConfirmacao(analise)}
                  carregando={pedindo}
                  dica="Envia um aviso para o familiar cadastrado"
                />
                {erroPedido ? <Texto cor={cores.perigo}>{erroPedido}</Texto> : null}
              </Bloco>
            </AlvoTutorial>
          )}

          <View style={styles.secao}>
            <AlvoTutorial id="lista-sinais">
              <Texto variante="subtitulo">
                {analise.sinais.length === 0
                  ? 'Nenhum sinal de alerta'
                  : `${analise.veredito === 'seguro' ? 'Pontos de atenção' : 'Por que parece golpe'} (${analise.sinais.length})`}
              </Texto>
            </AlvoTutorial>
            {analise.sinais.map((sinal) => (
              <View key={sinal.id} style={styles.sinal}>
                <View style={styles.iconeSinal}>
                  <Text style={styles.emoji}>{ICONES_SINAL[sinal.id] ?? ICONE_SINAL_PADRAO}</Text>
                </View>
                <View style={styles.flex}>
                  <Texto variante="destaque">{sinal.titulo}</Texto>
                  <Texto variante="legenda">{sinal.explicacao}</Texto>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.secao}>
            <Texto variante="subtitulo">Mensagem conferida</Texto>
            <View style={styles.mensagem}>
              <Texto>{analise.texto}</Texto>
            </View>
            <Texto variante="legenda" cor={cores.textoSuave}>
              Conferida em {formatarDataHora(analise.criadaEm)}
            </Texto>
          </View>
        </TelaRolavel>
      )}
    </ConteudoComEstado>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
  secao: { gap: espaco.medio },
  status: { borderWidth: 3, borderRadius: raio.medio, padding: espaco.medio, gap: espaco.pequeno },
  esperando: { flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno },
  semResposta: { backgroundColor: cores.superficie, borderRadius: raio.pequeno, padding: espaco.medio, gap: espaco.xs },
  sinal: {
    flexDirection: 'row',
    gap: espaco.medio,
    alignItems: 'flex-start',
    backgroundColor: cores.superficie,
    borderRadius: raio.medio,
    borderWidth: 2,
    borderColor: cores.borda,
    padding: espaco.medio,
  },
  iconeSinal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 30 },
  mensagem: {
    backgroundColor: cores.superficie,
    borderRadius: raio.medio,
    borderLeftWidth: 6,
    borderLeftColor: cores.bordaForte,
    padding: espaco.medio,
  },
});
