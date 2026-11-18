// Mostra a situação da permissão de notificação e o que a pessoa pode fazer.
// É aqui que a "permissão tratada" da rubrica aparece na tela.

import { StyleSheet, Text, View } from 'react-native';

import type { SituacaoPermissao } from '../services/notificacoes';
import { cores, espaco, raio } from '../theme';
import { useTema } from '../theme/useTema';
import { BotaoGrande } from './BotaoGrande';
import { Texto } from './Texto';

interface Props {
  situacao: SituacaoPermissao;
  aoPedir: () => void;
  aoAbrirConfiguracoes: () => void;
}

interface Conteudo {
  icone: string;
  titulo: string;
  texto: string;
  fundo: string;
  borda: string;
  botao?: { titulo: string; acao: () => void };
}

export function AvisoPermissao({ situacao, aoPedir, aoAbrirConfiguracoes }: Props) {
  const tema = useTema();

  // Um conteúdo por situação; `null` = nada a mostrar.
  const conteudos: Record<SituacaoPermissao, Conteudo | null> = {
    verificando: null,
    concedida: {
      icone: '🔔',
      titulo: 'Avisos ligados',
      texto: 'O celular vai tocar quando chegar um pedido novo.',
      fundo: cores.sucessoFundo,
      borda: cores.sucesso,
    },
    pode_pedir: {
      icone: '🔕',
      titulo: 'Receba um aviso na hora',
      texto: 'Quando seu familiar pedir uma confirmação, o celular avisa você na mesma hora.',
      fundo: tema.claro,
      borda: tema.principal,
      botao: { titulo: 'Ativar avisos', acao: aoPedir },
    },
    negada: {
      icone: '🔇',
      titulo: 'Os avisos estão desligados',
      texto:
        'Os pedidos continuam aparecendo nesta tela, mas o celular não vai tocar. Para ligar, permita as notificações nas configurações.',
      fundo: cores.atencaoFundo,
      borda: cores.atencao,
      botao: { titulo: 'Abrir configurações', acao: aoAbrirConfiguracoes },
    },
    indisponivel: {
      icone: 'ℹ️',
      titulo: 'Avisos indisponíveis aqui',
      texto: 'Neste aparelho os avisos não funcionam, mas os pedidos novos aparecem nesta lista sozinhos.',
      fundo: cores.superficie,
      borda: cores.borda,
    },
  };

  const conteudo = conteudos[situacao];
  if (!conteudo) return null;

  return (
    <View style={[styles.caixa, { backgroundColor: conteudo.fundo, borderColor: conteudo.borda }]}>
      <View style={styles.linha}>
        <Text style={styles.icone}>{conteudo.icone}</Text>
        <View style={styles.textos}>
          <Texto variante="destaque">{conteudo.titulo}</Texto>
          <Texto variante="legenda">{conteudo.texto}</Texto>
        </View>
      </View>
      {conteudo.botao ? (
        <BotaoGrande titulo={conteudo.botao.titulo} compacto variante="secundario" onPress={conteudo.botao.acao} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { borderRadius: raio.medio, borderWidth: 3, padding: espaco.medio, gap: espaco.medio },
  linha: { flexDirection: 'row', gap: espaco.medio, alignItems: 'flex-start' },
  icone: { fontSize: 32 },
  textos: { flex: 1, gap: espaco.xs },
});
