// Tela de entrada (login). Quem já entrou neste celular aparece em
// "Entrar rápido": um toque e pronto, sem digitar telefone nem PIN.

import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CaixaMarcar } from '../components/CaixaMarcar';
import { CampoTexto } from '../components/CampoTexto';
import { Gui } from '../components/ilustracoes/Gui';
import { Bloco, Cabecalho, TelaRolavel } from '../components/Layout';
import { Texto } from '../components/Texto';
import { useUsuario } from '../contexts/UsuarioContext';
import type { TelaProps } from '../navigation/tipos';
import { cores, espaco, paletas, raio } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import { PERFIS, type Usuario } from '../types';
import { apenasDigitos, ErroCredenciais, formatarTelefone, mascararTelefone, mensagemDeErro } from '../utils';
import { semErros, TAMANHO_PIN, validarEntrada, type DadosEntrada, type ErrosDe } from '../validation';

/** Depois de tantos erros seguidos, a entrada fica bloqueada por um tempo. */
const MAXIMO_TENTATIVAS = 5;
const TEMPO_BLOQUEIO_MS = 30_000;

const perfilDe = (conta: Usuario) => PERFIS.find((p) => p.valor === conta.perfil);

export function EntrarScreen({ navigation }: TelaProps<'Entrar'>) {
  const { entrar, entrarComConta, esquecerConta, contasLembradas } = useUsuario();
  const { rever } = useTutorialDaTela('entrar');

  const [dados, setDados] = useState<DadosEntrada>({ telefone: '', pin: '' });
  const [erros, setErros] = useState<ErrosDe<DadosEntrada>>({});
  const [lembrar, setLembrar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [entrandoId, setEntrandoId] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [tentativas, setTentativas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState<number | null>(null);
  const [agora, setAgora] = useState(Date.now());

  // Contagem regressiva do bloqueio, segundo a segundo.
  useEffect(() => {
    if (bloqueadoAte === null) return;
    const relogio = setInterval(() => {
      const instante = Date.now();
      setAgora(instante);
      if (instante >= bloqueadoAte) {
        setBloqueadoAte(null);
        setTentativas(0);
        setErroGeral(null);
      }
    }, 1000);
    return () => clearInterval(relogio);
  }, [bloqueadoAte]);

  const segundosBloqueado = bloqueadoAte === null ? 0 : Math.max(Math.ceil((bloqueadoAte - agora) / 1000), 0);

  function alterar<K extends keyof DadosEntrada>(campo: K, valor: DadosEntrada[K]) {
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    if (erros[campo]) setErros(validarEntrada(novos));
  }

  async function enviar() {
    if (bloqueadoAte !== null) return;
    const encontrados = validarEntrada(dados);
    setErros(encontrados);
    if (!semErros(encontrados)) return;

    setEnviando(true);
    setErroGeral(null);
    try {
      await entrar(dados.telefone, dados.pin, lembrar); // a navegação troca sozinha
    } catch (erro: unknown) {
      if (erro instanceof ErroCredenciais) {
        const total = tentativas + 1;
        setTentativas(total);
        if (total >= MAXIMO_TENTATIVAS) {
          setAgora(Date.now());
          setBloqueadoAte(Date.now() + TEMPO_BLOQUEIO_MS);
        }
        const restantes = MAXIMO_TENTATIVAS - total;
        setErroGeral(restantes > 0 ? `${mensagemDeErro(erro)} Restam ${restantes} tentativas.` : null);
      } else {
        setErroGeral(mensagemDeErro(erro));
      }
      alterar('pin', '');
      setEnviando(false);
    }
  }

  async function entrarRapido(conta: Usuario) {
    setEntrandoId(conta.id);
    try {
      await entrarComConta(conta);
    } catch (erro: unknown) {
      setErroGeral(mensagemDeErro(erro));
      setEntrandoId(null);
    }
  }

  return (
    <TelaRolavel
      topo={
        <Cabecalho
          semBarra
          titulo="Alethos"
          subtitulo="Seu guardião antigolpe. Confira a mensagem e chame a família antes de mandar dinheiro."
          ilustracao={<Gui tamanho={104} />}
          aoPedirDicas={rever}
        />
      }
    >
      {contasLembradas.length > 0 ? (
        <AlvoTutorial id="contas-lembradas">
          <Bloco>
            <View>
              <Texto variante="subtitulo">Entrar rápido</Texto>
              <Texto variante="legenda" cor={cores.textoSuave}>
                Toque no seu nome para entrar sem digitar nada.
              </Texto>
            </View>
            {contasLembradas.map((conta) => {
              const perfil = perfilDe(conta);
              const paleta = paletas[conta.perfil];
              return (
                <View key={conta.id} style={styles.conta}>
                  <Pressable
                    onPress={() => void entrarRapido(conta)}
                    disabled={entrandoId !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`Entrar como ${conta.nome}`}
                    style={({ pressed }) => [
                      styles.contaBotao,
                      { borderColor: paleta.principal, backgroundColor: paleta.claro },
                      pressed && styles.pressionado,
                    ]}
                  >
                    <Text style={styles.avatar}>{perfil?.icone}</Text>
                    <View style={styles.flex}>
                      <Texto variante="subtitulo" cor={paleta.escuro}>
                        {conta.nome}
                      </Texto>
                      <Texto variante="legenda">
                        {conta.perfil === 'idoso' ? 'Confere mensagens' : 'Protege a família'} · {mascararTelefone(conta.telefone)}
                      </Texto>
                    </View>
                    {entrandoId === conta.id ? (
                      <ActivityIndicator color={paleta.principal} />
                    ) : (
                      <Text style={[styles.seta, { color: paleta.principal }]}>›</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => void esquecerConta(conta.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Esquecer a conta de ${conta.nome} neste celular`}
                    hitSlop={8}
                  >
                    <Texto variante="legenda" cor={cores.textoSuave} style={styles.esquecer}>
                      Esquecer
                    </Texto>
                  </Pressable>
                </View>
              );
            })}
          </Bloco>
        </AlvoTutorial>
      ) : null}

      <Texto variante="subtitulo">
        {contasLembradas.length > 0 ? 'Ou entre com telefone e PIN' : 'Entre na sua conta'}
      </Texto>

      <AlvoTutorial id="entrar-telefone">
        <CampoTexto
          rotulo="Telefone com DDD"
          valor={dados.telefone}
          aoMudar={(texto) => alterar('telefone', formatarTelefone(texto))}
          onBlur={() => setErros(validarEntrada(dados))}
          erro={erros.telefone}
          placeholder="(11) 98888-0000"
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={15}
        />
      </AlvoTutorial>

      <AlvoTutorial id="entrar-pin">
        <CampoTexto
          rotulo={`PIN (${TAMANHO_PIN} números)`}
          valor={dados.pin}
          aoMudar={(texto) => alterar('pin', apenasDigitos(texto))}
          erro={erros.pin}
          placeholder="••••"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={TAMANHO_PIN}
          returnKeyType="done"
          onSubmitEditing={() => void enviar()}
        />
      </AlvoTutorial>

      <CaixaMarcar
        rotulo="Lembrar de mim neste celular"
        ajuda="Na próxima vez, é só tocar no seu nome."
        marcado={lembrar}
        aoMudar={setLembrar}
      />

      {segundosBloqueado > 0 ? (
        <View style={styles.bloqueio} accessibilityLiveRegion="assertive">
          <Texto variante="destaque" cor={cores.perigo}>
            🔒 Muitas tentativas erradas.
          </Texto>
          <Texto variante="legenda">Por segurança, espere {segundosBloqueado} segundos para tentar de novo.</Texto>
        </View>
      ) : erroGeral ? (
        <Texto variante="destaque" cor={cores.perigo} accessibilityLiveRegion="polite">
          {erroGeral}
        </Texto>
      ) : null}

      <BotaoGrande
        titulo="Entrar"
        icone="🔓"
        onPress={() => void enviar()}
        carregando={enviando}
        desabilitado={segundosBloqueado > 0}
      />

      <AlvoTutorial id="botao-criar-conta">
        <BotaoGrande
          titulo="Criar minha conta"
          icone="✨"
          variante="secundario"
          onPress={() => navigation.navigate('Cadastro')}
          dica="Abre o cadastro, que leva menos de um minuto"
        />
      </AlvoTutorial>

      <Bloco>
        <Texto variante="legenda" cor={cores.textoSuave}>
          🔒 Seu PIN fica protegido e nunca é mostrado. O Alethos nunca pede senha do banco, CPF ou código por mensagem.
        </Texto>
      </Bloco>
    </TelaRolavel>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  conta: { gap: espaco.xs },
  contaBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.medio,
    borderWidth: 3,
    borderRadius: raio.medio,
    padding: espaco.medio,
  },
  pressionado: { opacity: 0.85 },
  avatar: { fontSize: 36 },
  seta: { fontSize: 40, lineHeight: 42 },
  esquecer: { textAlign: 'right', textDecorationLine: 'underline' },
  bloqueio: {
    backgroundColor: cores.perigoFundo,
    borderRadius: raio.pequeno,
    borderWidth: 2,
    borderColor: cores.perigo,
    padding: espaco.medio,
    gap: espaco.xs,
  },
});
