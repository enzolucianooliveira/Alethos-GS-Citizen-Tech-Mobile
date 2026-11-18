// Cartões usados nas listas (FlatList) das telas.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { aparenciaVeredito, cores, espaco, raio, sombra } from '../theme';
import { useTema } from '../theme/useTema';
import { ORIGENS, type Analise, type Pedido, type RespostaPedido, type StatusPedido } from '../types';
import { formatarDataHora, resumir } from '../utils';
import { BotaoGrande } from './BotaoGrande';
import { SeloVeredito } from './SeloVeredito';
import { Texto } from './Texto';

const origemDe = (valor: Analise['origem']) => ORIGENS.find((o) => o.valor === valor);

export function CartaoAnalise({ analise, aoTocar }: { analise: Analise; aoTocar: () => void }) {
  const origem = origemDe(analise.origem);
  const { cor } = aparenciaVeredito[analise.veredito];
  return (
    <Pressable
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityHint="Abre o resultado completo desta análise"
      style={({ pressed }) => [styles.cartao, { borderLeftColor: cor }, pressed && styles.pressionado]}
    >
      <View style={styles.linhaTopo}>
        <SeloVeredito veredito={analise.veredito} />
        <Text style={styles.seta}>›</Text>
      </View>
      <Texto>“{resumir(analise.texto, 90)}”</Texto>
      <Texto variante="legenda" cor={cores.textoSuave}>
        {origem?.icone} {origem?.rotulo ?? analise.origem} · {formatarDataHora(analise.criadaEm)}
      </Texto>
    </Pressable>
  );
}

const APARENCIA_STATUS: Record<StatusPedido, { rotulo: string; icone: string; cor: string; fundo: string }> = {
  pendente: { rotulo: 'Esperando sua resposta', icone: '⏳', cor: cores.atencao, fundo: cores.atencaoFundo },
  aprovado: { rotulo: 'Você liberou: pode seguir', icone: '✅', cor: cores.sucesso, fundo: cores.sucessoFundo },
  negado: { rotulo: 'Você barrou: era golpe', icone: '🛑', cor: cores.perigo, fundo: cores.perigoFundo },
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
  const tema = useTema();
  const status = APARENCIA_STATUS[pedido.status];
  const pendente = pedido.status === 'pendente';

  return (
    <View style={[styles.cartao, { borderLeftColor: pendente ? cores.atencao : tema.principal }]}>
      <View style={styles.linhaTopo}>
        <View style={[styles.avatar, { backgroundColor: tema.claro }]}>
          <Text style={styles.avatarIcone}>{pedido.origem === 'dispositivo' ? '🔘' : '📲'}</Text>
        </View>
        <View style={styles.flex}>
          <Texto variante="subtitulo">{pedido.idosoNome}</Texto>
          <Texto variante="legenda" cor={cores.textoSuave}>
            {pedido.origem === 'dispositivo' ? 'Pelo botão em casa' : 'Pelo app'} · {formatarDataHora(pedido.criadoEm)}
          </Texto>
        </View>
      </View>
      <Texto>{pedido.descricao}</Texto>
      <View style={[styles.status, { backgroundColor: status.fundo }]}>
        <Texto variante="destaque" cor={status.cor}>
          {status.icone} {status.rotulo}
        </Texto>
      </View>
      {pendente ? (
        <View style={styles.acoes}>
          <BotaoGrande
            titulo="Pode seguir"
            icone="👍"
            variante="sucesso"
            carregando={respondendo}
            onPress={() => aoResponder('aprovado')}
            dica="Avisa que você conferiu e está tudo certo"
          />
          <BotaoGrande
            titulo="Pare, é golpe"
            icone="✋"
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
  flex: { flex: 1 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.medio,
    borderLeftWidth: 8,
    padding: espaco.medio,
    gap: espaco.pequeno,
    ...sombra,
  },
  pressionado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.medio },
  seta: { fontSize: 36, color: cores.bordaForte, lineHeight: 38 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarIcone: { fontSize: 28 },
  status: { alignSelf: 'flex-start', borderRadius: raio.pequeno, paddingHorizontal: espaco.medio, paddingVertical: espaco.pequeno },
  acoes: { gap: espaco.medio, marginTop: espaco.pequeno },
});
