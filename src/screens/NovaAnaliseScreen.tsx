// Formulário validado que CRIA um item: o idoso cola a mensagem suspeita.

import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CampoTexto } from '../components/CampoTexto';
import { Gui } from '../components/ilustracoes/Gui';
import { TelaRolavel } from '../components/Layout';
import { SeletorOpcoes } from '../components/SeletorOpcoes';
import { Texto } from '../components/Texto';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { cores, espaco } from '../theme';
import { AlvoTutorial } from '../tutorial/AlvoTutorial';
import { useTutorialDaTela } from '../tutorial/useTutorialDaTela';
import { ORIGENS } from '../types';
import { mensagemDeErro } from '../utils';
import {
  LIMITES_MENSAGEM,
  semErros,
  validarNovaAnalise,
  type DadosNovaAnalise,
  type ErrosDe,
} from '../validation';

export function NovaAnaliseScreen({ navigation }: TelaProps<'NovaAnalise'>) {
  const usuario = useUsuarioLogado();
  useTutorialDaTela('novaAnalise');
  const [dados, setDados] = useState<DadosNovaAnalise>({ texto: '', origem: null });
  const [erros, setErros] = useState<ErrosDe<DadosNovaAnalise>>({});
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function alterar<K extends keyof DadosNovaAnalise>(campo: K, valor: DadosNovaAnalise[K]) {
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    if (erros[campo]) setErros(validarNovaAnalise(novos));
  }

  /** Cola o que a pessoa copiou no WhatsApp ou SMS, sem precisar segurar o dedo no campo. */
  async function colar() {
    setAviso(null);
    try {
      const copiado = await Clipboard.getStringAsync();
      if (copiado.trim().length === 0) {
        setAviso('Não tem nenhum texto copiado. Copie a mensagem primeiro e volte aqui.');
        return;
      }
      alterar('texto', copiado.slice(0, LIMITES_MENSAGEM.maximo));
    } catch {
      setAviso('Não consegui colar. Toque e segure no campo e escolha Colar.');
    }
  }

  async function conferir() {
    const encontrados = validarNovaAnalise(dados);
    setErros(encontrados);
    if (!semErros(encontrados) || dados.origem === null) return;

    setEnviando(true);
    setAviso(null);
    try {
      const analise = await api.criarAnalise({
        usuarioId: usuario.id,
        texto: dados.texto.trim(),
        origem: dados.origem,
      });
      // `replace`: ao voltar do resultado, a pessoa cai na lista (já com o item novo), não no formulário.
      navigation.replace('DetalheAnalise', { id: analise.id });
    } catch (erro: unknown) {
      setAviso(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  const restantes = LIMITES_MENSAGEM.maximo - dados.texto.length;

  return (
    <TelaRolavel>
      <View style={styles.intro}>
        <Gui tamanho={72} />
        <Texto style={styles.flex}>Copie a mensagem estranha e cole aqui. Eu procuro os sinais de golpe para você.</Texto>
      </View>

      <AlvoTutorial id="campo-mensagem">
        <CampoTexto
          rotulo="Mensagem recebida"
          ajuda={`Pode colar até ${LIMITES_MENSAGEM.maximo} letras (faltam ${restantes}).`}
          valor={dados.texto}
          aoMudar={(texto) => alterar('texto', texto)}
          onBlur={() => setErros(validarNovaAnalise(dados))}
          erro={erros.texto}
          placeholder="Ex.: Oi mãe, troquei de número. Me manda um Pix urgente..."
          maxLength={LIMITES_MENSAGEM.maximo}
          multiline
        />
      </AlvoTutorial>

      <AlvoTutorial id="botao-colar">
        <BotaoGrande titulo="Colar mensagem copiada" icone="📋" variante="claro" compacto onPress={() => void colar()} />
      </AlvoTutorial>

      <AlvoTutorial id="escolha-origem">
        <SeletorOpcoes
          rotulo="Por onde chegou?"
          opcoes={ORIGENS}
          selecionado={dados.origem}
          aoSelecionar={(origem) => alterar('origem', origem)}
          erro={erros.origem}
        />
      </AlvoTutorial>

      {aviso ? <Texto cor={cores.perigo}>{aviso}</Texto> : null}

      <AlvoTutorial id="botao-conferir">
        <BotaoGrande
          titulo={enviando ? 'Conferindo...' : 'Conferir'}
          icone="🔍"
          onPress={() => void conferir()}
          carregando={enviando}
          dica="Procura sinais de golpe na mensagem"
        />
      </AlvoTutorial>
    </TelaRolavel>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { flexDirection: 'row', alignItems: 'center', gap: espaco.medio },
});
