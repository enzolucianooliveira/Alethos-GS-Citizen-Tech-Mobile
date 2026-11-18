import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { CampoTexto } from '../components/CampoTexto';
import { Paragrafo, TelaRolavel } from '../components/Layout';
import { SeletorOpcoes } from '../components/SeletorOpcoes';
import { useUsuario } from '../contexts/UsuarioContext';
import { cores, espaco, fonte } from '../theme';
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
    <TelaRolavel>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo} accessibilityRole="header">
          Desconfie antes de agir
        </Text>
        <Paragrafo>
          Recebeu uma mensagem estranha pedindo dinheiro, senha ou pressa? Cole aqui e veja os sinais de
          golpe. Antes de transferir, peça para sua família confirmar.
        </Paragrafo>
      </View>

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

      <SeletorOpcoes
        rotulo="Como você vai usar o app?"
        opcoes={PERFIS}
        selecionado={dados.perfil}
        aoSelecionar={(perfil) => alterar('perfil', perfil)}
        erro={erros.perfil}
        emColuna
      />

      {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

      <BotaoGrande titulo="Continuar" onPress={() => void continuar()} carregando={enviando} />
      <Paragrafo suave>Seu nome fica salvo só neste celular. Não pedimos senha, CPF nem dados do banco.</Paragrafo>
    </TelaRolavel>
  );
}

const styles = StyleSheet.create({
  cabecalho: { gap: espaco.pequeno },
  titulo: { fontSize: fonte.titulo, fontWeight: '800', color: cores.primario },
  erroGeral: { fontSize: fonte.normal, color: cores.perigo, fontWeight: '600' },
});
