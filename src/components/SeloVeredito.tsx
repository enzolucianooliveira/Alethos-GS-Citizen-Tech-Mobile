import { StyleSheet, View } from 'react-native';

import { aparenciaVeredito, cores, espaco, raio, sombra } from '../theme';
import type { Veredito } from '../types';
import { IconeVeredito } from './ilustracoes/Cenas';
import { Texto } from './Texto';

/** Etiqueta pequena, usada nos cartões da lista. */
export function SeloVeredito({ veredito }: { veredito: Veredito }) {
  const { rotulo, cor, fundo } = aparenciaVeredito[veredito];
  return (
    <View style={[styles.selo, { backgroundColor: fundo, borderColor: cor }]} accessibilityLabel={`Resultado: ${rotulo}`}>
      <IconeVeredito veredito={veredito} tamanho={26} />
      <Texto variante="destaque" cor={cor}>
        {rotulo}
      </Texto>
    </View>
  );
}

/** Cartão grande do resultado, no topo da tela de detalhe. */
export function CartaoVeredito({ veredito }: { veredito: Veredito }) {
  const { rotulo, frase, cor } = aparenciaVeredito[veredito];
  return (
    <View
      style={[styles.cartao, { backgroundColor: cor }]}
      accessibilityRole="summary"
      accessibilityLabel={`Resultado: ${rotulo}. ${frase}`}
    >
      <IconeVeredito veredito={veredito} tamanho={92} />
      <View style={styles.textos}>
        <Texto variante="enorme" cor={cores.branco}>
          {rotulo}
        </Texto>
        <Texto variante="destaque" cor={cores.branco}>
          {frase}
        </Texto>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.pequeno,
    borderWidth: 2,
    borderRadius: raio.grande,
    paddingLeft: espaco.pequeno,
    paddingRight: espaco.medio,
    paddingVertical: espaco.xs,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.medio,
    borderRadius: raio.grande,
    padding: espaco.grande,
    ...sombra,
  },
  textos: { flex: 1, gap: espaco.xs },
});
