// Cartões usados nas listas (FlatList) das telas.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '../theme';
import { ORIGENS, type Analise, type Pedido, type RespostaPedido, type StatusPedido } from '../types';
import { formatarDataHora, resumir } from '../utils';
import { BotaoGrande } from './BotaoGrande';
import { SeloVeredito } from './SeloVeredito';

const rotuloOrigem = (valor: Analise['origem']) =>
  ORIGENS.find((o) => o.valor === valor)?.rotulo ?? valor;

export function CartaoAnalise({ analise, aoTocar }: { analise: Analise; aoTocar: () => void }) {
  return (
    <Pressable
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityHint="Abre os detalhes desta análise"
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
    >
      <SeloVeredito veredito={analise.veredito} />
      <Text style={styles.texto}>“{resumir(analise.texto, 90)}”</Text>
      <Text style={styles.meta}>
        {rotuloOrigem(analise.origem)} · {formatarDataHora(analise.criadaEm)}
      </Text>
    </Pressable>
  );
}

const APARENCIA_STATUS: Record<StatusPedido, { rotulo: string; cor: string; fundo: string }> = {
  pendente: { rotulo: 'Aguardando resposta', cor: cores.atencao, fundo: cores.atencaoFundo },
  aprovado: { rotulo: 'Você confirmou: pode seguir', cor: cores.sucesso, fundo: cores.sucessoFundo },
  negado: { rotulo: 'Você pediu para não seguir', cor: cores.perigo, fundo: cores.perigoFundo },
};

export function CartaoPedido({
  pedido,
  aoResponder,
  respondendo,
}: {
  pedido: Pedido;
  aoResponder: (resposta: RespostaPedido) => void;
  respondendo: boolean;
}) {
  const status = APARENCIA_STATUS[pedido.status];
  return (
    <View style={[styles.cartao, pedido.status === 'pendente' && styles.cartaoDestaque]}>
      <Text style={styles.titulo}>{pedido.idosoNome}</Text>
      <Text style={styles.texto}>{pedido.descricao}</Text>
      <Text style={styles.meta}>
        {pedido.origem === 'dispositivo' ? 'Pelo botão físico' : 'Pelo app'} ·{' '}
        {formatarDataHora(pedido.criadoEm)}
      </Text>
      <Text style={[styles.status, { color: status.cor, backgroundColor: status.fundo }]}>{status.rotulo}</Text>
      {pedido.status === 'pendente' ? (
        <View style={styles.acoes}>
          <BotaoGrande
            titulo="Pode seguir"
            variante="sucesso"
            carregando={respondendo}
            onPress={() => aoResponder('aprovado')}
            dica="Avisa que você conferiu e está tudo certo"
          />
          <BotaoGrande
            titulo="Não faça nada, é golpe"
            variante="perigo"
            desabilitado={respondendo}
            onPress={() => aoResponder('negado')}
            dica="Avisa para não transferir nem responder"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.medio,
    gap: espaco.pequeno,
  },
  cartaoDestaque: { borderWidth: 2, borderColor: cores.atencao },
  pressionado: { opacity: 0.8 },
  titulo: { fontSize: fonte.grande, fontWeight: '700', color: cores.texto },
  texto: { fontSize: fonte.normal, color: cores.texto, lineHeight: 27 },
  meta: { fontSize: fonte.pequena, color: cores.textoSuave },
  status: {
    alignSelf: 'flex-start',
    fontSize: fonte.pequena,
    fontWeight: '700',
    paddingHorizontal: espaco.pequeno,
    paddingVertical: espaco.xs,
    borderRadius: 8,
    overflow: 'hidden',
  },
  acoes: { gap: espaco.pequeno, marginTop: espaco.pequeno },
});
