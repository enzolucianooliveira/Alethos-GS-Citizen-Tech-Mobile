// Resultado de uma análise: veredito, sinais explicados e o pedido de
// confirmação para a família. Recebe só o `id` pela rota (tipado).

import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotaoGrande } from '../components/BotaoGrande';
import { ConteudoComEstado } from '../components/Estados';
import { Paragrafo, Subtitulo, TelaRolavel } from '../components/Layout';
import { SeloVeredito } from '../components/SeloVeredito';
import { useUsuarioLogado } from '../contexts/UsuarioContext';
import { useCarregamento } from '../hooks/useCarregamento';
import type { TelaProps } from '../navigation/tipos';
import { api } from '../services/api';
import { aparenciaVeredito, cores, espaco, fonte, raio } from '../theme';
import type { Analise, Pedido, StatusPedido } from '../types';
import { formatarDataHora, mensagemDeErro, resumir } from '../utils';

interface Detalhe {
  analise: Analise;
  pedido: Pedido | null;
}

const TEXTO_STATUS: Record<StatusPedido, { titulo: string; texto: string; cor: string; fundo: string }> = {
  pendente: {
    titulo: 'Aguardando sua família',
    texto: 'Não faça nada até receber a resposta. Toque em Ver resposta para conferir.',
    cor: cores.atencao,
    fundo: cores.atencaoFundo,
  },
  aprovado: {
    titulo: 'Sua família conferiu: pode seguir',
    texto: 'Mesmo assim, nunca passe senha ou código para ninguém.',
    cor: cores.sucesso,
    fundo: cores.sucessoFundo,
  },
  negado: {
    titulo: 'Sua família pediu: NÃO siga',
    texto: 'Não responda, não clique e não transfira. Se quiser, bloqueie o número.',
    cor: cores.perigo,
    fundo: cores.perigoFundo,
  },
};

export function DetalheAnaliseScreen({ route }: TelaProps<'DetalheAnalise'>) {
  const { id } = route.params; // tipado: o TypeScript sabe que é string
  const usuario = useUsuarioLogado();

  const carregar = useCallback(async (): Promise<Detalhe> => {
    // As duas buscas são independentes, então rodam ao mesmo tempo.
    const [analise, pedido] = await Promise.all([api.buscarAnalise(id), api.buscarPedidoDaAnalise(id)]);
    return { analise, pedido };
  }, [id]);
  const { estado, tentarDeNovo, recarregar, substituirDados } = useCarregamento(carregar);

  const [pedindo, setPedindo] = useState(false);
  const [erroPedido, setErroPedido] = useState<string | null>(null);

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
          <SeloVeredito veredito={analise.veredito} grande />
          <Paragrafo>{aparenciaVeredito[analise.veredito].conselho}</Paragrafo>

          <View style={styles.bloco}>
            <Subtitulo>
              {analise.sinais.length === 0
                ? 'Nenhum sinal de alerta encontrado'
                : `${analise.veredito === 'seguro' ? 'Pontos de atenção' : 'Sinais de alerta encontrados'} (${analise.sinais.length})`}
            </Subtitulo>
            {analise.sinais.map((sinal) => (
              <View key={sinal.id} style={styles.sinal}>
                <Text style={styles.sinalTitulo}>• {sinal.titulo}</Text>
                <Text style={styles.sinalTexto}>{sinal.explicacao}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bloco}>
            <Subtitulo>Mensagem analisada</Subtitulo>
            <Text style={styles.mensagem}>{analise.texto}</Text>
            <Paragrafo suave>Analisada em {formatarDataHora(analise.criadaEm)}</Paragrafo>
          </View>

          {pedido ? (
            <View
              style={[styles.status, { borderColor: TEXTO_STATUS[pedido.status].cor, backgroundColor: TEXTO_STATUS[pedido.status].fundo }]}
              accessibilityLiveRegion="polite"
            >
              <Text style={[styles.statusTitulo, { color: TEXTO_STATUS[pedido.status].cor }]}>
                {TEXTO_STATUS[pedido.status].titulo}
              </Text>
              <Text style={styles.sinalTexto}>{TEXTO_STATUS[pedido.status].texto}</Text>
              {pedido.status === 'pendente' ? (
                <BotaoGrande titulo="Ver resposta" variante="secundario" onPress={() => void recarregar()} />
              ) : null}
            </View>
          ) : (
            <View style={styles.bloco}>
              <Paragrafo>Vai transferir dinheiro ou passar algum dado? Peça para alguém de confiança conferir antes.</Paragrafo>
              <BotaoGrande
                titulo="Pedir para minha família confirmar"
                onPress={() => void pedirConfirmacao(analise)}
                carregando={pedindo}
                dica="Envia um aviso para o familiar cadastrado"
              />
              {erroPedido ? <Text style={styles.erro}>{erroPedido}</Text> : null}
            </View>
          )}
        </TelaRolavel>
      )}
    </ConteudoComEstado>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.medio },
  sinal: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.medio,
    gap: espaco.xs,
  },
  sinalTitulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  sinalTexto: { fontSize: fonte.pequena + 1, color: cores.texto, lineHeight: 25 },
  mensagem: {
    fontSize: fonte.normal,
    color: cores.texto,
    lineHeight: 28,
    backgroundColor: cores.superficie,
    borderLeftWidth: 4,
    borderLeftColor: cores.borda,
    padding: espaco.medio,
  },
  status: { borderWidth: 2, borderRadius: raio, padding: espaco.medio, gap: espaco.pequeno },
  statusTitulo: { fontSize: fonte.grande, fontWeight: '800' },
  erro: { fontSize: fonte.normal, color: cores.perigo, fontWeight: '600' },
});
