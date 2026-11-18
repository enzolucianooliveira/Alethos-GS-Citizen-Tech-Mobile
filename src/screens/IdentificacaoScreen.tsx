import { useState } from 'react';

import { BotaoGrande } from '../components/BotaoGrande';
import { CampoTexto } from '../components/CampoTexto';
import { Gui } from '../components/ilustracoes/Gui';
import { Bloco, Cabecalho, TelaRolavel } from '../components/Layout';
import { SeletorOpcoes } from '../components/SeletorOpcoes';
import { Texto } from '../components/Texto';
import { useUsuario } from '../contexts/UsuarioContext';
import { cores } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import { PERFIS } from '../types';
import { mensagemDeErro } from '../utils';
import {
  LIMITES_NOME,
  semErros,
  validarIdentificacao,
  type DadosIdentificacao,
  type ErrosDe,
} from '../validation';

export function IdentificacaoScreen() {
  const { entrar } = useUsuario();
  const { rever } = useTutorialDaTela('identificacao');
  const [dados, setDados] = useState<DadosIdentificacao>({ nome: '', perfil: null });
  const [erros, setErros] = useState<ErrosDe<DadosIdentificacao>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Atualiza um campo e, se ele tinha erro, revalida na hora (feedback imediato).
  function alterar<K extends keyof DadosIdentificacao>(campo: K, valor: DadosIdentificacao[K]) {
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    if (erros[campo]) setErros(validarIdentificacao(novos));
  }

  async function continuar() {
    const encontrados = validarIdentificacao(dados);
    setErros(encontrados);
    if (!semErros(encontrados) || dados.perfil === null) return;

    setEnviando(true);
    setErroGeral(null);
    try {
      await entrar(dados.nome, dados.perfil); // grava no AsyncStorage; a navegação troca sozinha
    } catch (erro: unknown) {
      setErroGeral(mensagemDeErro(erro));
      setEnviando(false);
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
      <AlvoTutorial id="campo-nome">
        <CampoTexto
          rotulo="Como podemos chamar você?"
          valor={dados.nome}
          aoMudar={(nome) => alterar('nome', nome)}
          onBlur={() => setErros(validarIdentificacao(dados))}
          erro={erros.nome}
          placeholder="Ex.: Maria"
          maxLength={LIMITES_NOME.maximo}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="done"
        />
      </AlvoTutorial>

      <AlvoTutorial id="escolha-perfil">
        <SeletorOpcoes
          rotulo="Como você vai usar o app?"
          opcoes={PERFIS}
          selecionado={dados.perfil}
          aoSelecionar={(perfil) => alterar('perfil', perfil)}
          erro={erros.perfil}
          formato="cartao"
        />
      </AlvoTutorial>

      {erroGeral ? <Texto cor={cores.perigo}>{erroGeral}</Texto> : null}

      <AlvoTutorial id="botao-continuar">
        <BotaoGrande titulo="Continuar" icone="👉" onPress={() => void continuar()} carregando={enviando} />
      </AlvoTutorial>

      <Bloco>
        <Texto variante="legenda" cor={cores.textoSuave}>
          🔒 Seu nome fica salvo só neste celular. Nunca pedimos senha, CPF ou dados do banco.
        </Texto>
      </Bloco>
    </TelaRolavel>
  );
}
