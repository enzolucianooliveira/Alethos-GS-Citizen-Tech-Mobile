// Formulário validado que CRIA um item: o idoso cola a mensagem suspeita.

import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CampoTexto } from '../components/CampoTexto';
import { Paragrafo, TelaRolavel } from '../components/Layout';
import { SeletorOpcoes } from '../components/SeletorOpcoes';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { cores, fonte } from '../theme';
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
  const [dados, setDados] = useState<DadosNovaAnalise>({ texto: '', origem: null });
  const [erros, setErros] = useState<ErrosDe<DadosNovaAnalise>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  function alterar<K extends keyof DadosNovaAnalise>(campo: K, valor: DadosNovaAnalise[K]) {
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    if (erros[campo]) setErros(validarNovaAnalise(novos));
  }

  async function analisar() {
    const encontrados = validarNovaAnalise(dados);
    setErros(encontrados);
    if (!semErros(encontrados) || dados.origem === null) return;

    setEnviando(true);
    setErroEnvio(null);
    try {
      const analise = await api.criarAnalise({
        usuarioId: usuario.id,
        texto: dados.texto.trim(),
        origem: dados.origem,
      });
      // `replace`: ao voltar do resultado, a pessoa cai na lista (já com o item novo), não no formulário.
      navigation.replace('DetalheAnalise', { id: analise.id });
    } catch (erro: unknown) {
      setErroEnvio(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  const restantes = LIMITES_MENSAGEM.maximo - dados.texto.length;

  return (
    <TelaRolavel>
      <Paragrafo>
        Copie a mensagem do WhatsApp, SMS ou e-mail e cole abaixo. Se foi uma ligação, escreva o que a pessoa
        pediu.
      </Paragrafo>

      <CampoTexto
        rotulo="Mensagem recebida"
        ajuda={`Pode colar até ${LIMITES_MENSAGEM.maximo} caracteres (faltam ${restantes}).`}
        valor={dados.texto}
        aoMudar={(texto) => alterar('texto', texto)}
        onBlur={() => setErros(validarNovaAnalise(dados))}
        erro={erros.texto}
        placeholder="Ex.: Oi mãe, troquei de número. Me manda um Pix urgente..."
        maxLength={LIMITES_MENSAGEM.maximo}
        multiline
      />

      <SeletorOpcoes
        rotulo="Por onde chegou?"
        opcoes={ORIGENS}
        selecionado={dados.origem}
        aoSelecionar={(origem) => alterar('origem', origem)}
        erro={erros.origem}
      />

      {erroEnvio ? <Text style={styles.erro}>{erroEnvio}</Text> : null}

      <BotaoGrande
        titulo={enviando ? 'Analisando...' : 'Analisar'}
        onPress={() => void analisar()}
        carregando={enviando}
        dica="Procura sinais de golpe na mensagem"
      />
    </TelaRolavel>
  );
}

const styles = StyleSheet.create({
  erro: { fontSize: fonte.normal, color: cores.perigo, fontWeight: '600' },
});
