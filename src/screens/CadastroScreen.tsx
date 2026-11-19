// Cadastro rápido: nome, telefone, PIN de 4 números e perfil.
// Ao terminar, a pessoa já entra no app (e o celular lembra dela, se quiser).

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CaixaMarcar } from '../components/CaixaMarcar';
import { CampoTexto } from '../components/CampoTexto';
import { Gui } from '../components/ilustracoes/Gui';
import { TelaRolavel } from '../components/Layout';
import { SeletorOpcoes } from '../components/SeletorOpcoes';
import { Texto } from '../components/Texto';
import { useUsuario } from '../contexts/UsuarioContext';
import { cores, espaco } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import { PERFIS } from '../types';
import { apenasDigitos, formatarTelefone, mensagemDeErro } from '../utils';
import {
  LIMITES_NOME,
  semErros,
  TAMANHO_PIN,
  validarCadastro,
  type DadosCadastro,
  type ErrosDe,
} from '../validation';

const VAZIO: DadosCadastro = { nome: '', telefone: '', pin: '', confirmacaoPin: '', perfil: null };

export function CadastroScreen() {
  const { cadastrar } = useUsuario();
  useTutorialDaTela('cadastro');
  const [dados, setDados] = useState<DadosCadastro>(VAZIO);
  const [erros, setErros] = useState<ErrosDe<DadosCadastro>>({});
  const [lembrar, setLembrar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Atualiza um campo e, se ele tinha erro, revalida na hora (feedback imediato).
  function alterar<K extends keyof DadosCadastro>(campo: K, valor: DadosCadastro[K]) {
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    if (erros[campo]) setErros(validarCadastro(novos));
  }

  async function criarConta() {
    const encontrados = validarCadastro(dados);
    setErros(encontrados);
    if (!semErros(encontrados) || dados.perfil === null) return;

    setEnviando(true);
    setErroGeral(null);
    try {
      await cadastrar({ nome: dados.nome, telefone: dados.telefone, pin: dados.pin, perfil: dados.perfil }, lembrar);
    } catch (erro: unknown) {
      setErroGeral(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  return (
    <TelaRolavel>
      <View style={styles.intro}>
        <Gui tamanho={72} />
        <Texto style={styles.flex}>Leva menos de um minuto. Seu PIN é como a senha do cartão: só você sabe.</Texto>
      </View>

      <AlvoTutorial id="cadastro-nome">
        <CampoTexto
          rotulo="Como podemos chamar você?"
          valor={dados.nome}
          aoMudar={(nome) => alterar('nome', nome)}
          onBlur={() => setErros(validarCadastro(dados))}
          erro={erros.nome}
          placeholder="Ex.: Maria"
          maxLength={LIMITES_NOME.maximo}
          autoCapitalize="words"
          autoComplete="name"
        />
      </AlvoTutorial>

      <AlvoTutorial id="cadastro-telefone">
        <CampoTexto
          rotulo="Telefone com DDD"
          ajuda="Ele vai ser o seu login."
          valor={dados.telefone}
          aoMudar={(texto) => alterar('telefone', formatarTelefone(texto))}
          erro={erros.telefone}
          placeholder="(11) 98888-0000"
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={15}
        />
      </AlvoTutorial>

      <AlvoTutorial id="cadastro-pin">
        <View style={styles.pins}>
          <View style={styles.flex}>
            <CampoTexto
              rotulo="Crie um PIN"
              valor={dados.pin}
              aoMudar={(texto) => alterar('pin', apenasDigitos(texto))}
              erro={erros.pin}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={TAMANHO_PIN}
            />
          </View>
          <View style={styles.flex}>
            <CampoTexto
              rotulo="Repita o PIN"
              valor={dados.confirmacaoPin}
              aoMudar={(texto) => alterar('confirmacaoPin', apenasDigitos(texto))}
              erro={erros.confirmacaoPin}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={TAMANHO_PIN}
            />
          </View>
        </View>
      </AlvoTutorial>

      <AlvoTutorial id="cadastro-perfil">
        <SeletorOpcoes
          rotulo="Como você vai usar o app?"
          opcoes={PERFIS}
          selecionado={dados.perfil}
          aoSelecionar={(perfil) => alterar('perfil', perfil)}
          erro={erros.perfil}
          formato="cartao"
        />
      </AlvoTutorial>

      <CaixaMarcar
        rotulo="Lembrar de mim neste celular"
        ajuda="Na próxima vez, é só tocar no seu nome para entrar."
        marcado={lembrar}
        aoMudar={setLembrar}
      />

      {erroGeral ? (
        <Texto variante="destaque" cor={cores.perigo} accessibilityLiveRegion="polite">
          {erroGeral}
        </Texto>
      ) : null}

      <BotaoGrande titulo="Criar conta e entrar" icone="✅" onPress={() => void criarConta()} carregando={enviando} />
    </TelaRolavel>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
  pins: { flexDirection: 'row', gap: espaco.medio },
});
