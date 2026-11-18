// Mostra a situação da permissão de notificação e o que a pessoa pode fazer.
// É aqui que a "permissão tratada" da rúbrica aparece na tela.

import { StyleSheet, Text, View } from 'react-native';

import type { SituacaoPermissao } from '../services/notificacoes';
import { cores, espaco, fonte, raio } from '../theme';
import { BotaoGrande } from './BotaoGrande';

interface Props {
  situacao: SituacaoPermissao;
  aoPedir: () => void;
  aoAbrirConfiguracoes: () => void;
}

export function AvisoPermissao({ situacao, aoPedir, aoAbrirConfiguracoes }: Props) {
  switch (situacao) {
    case 'verificando':
    case 'concedida':
      return null; // nada a avisar

    case 'pode_pedir':
      return (
        <View style={[styles.caixa, styles.info]}>
          <Text style={styles.titulo}>Receba um aviso na hora</Text>
          <Text style={styles.texto}>
            Quando seu familiar pedir uma confirmação, o celular avisa você, mesmo com outra tela aberta.
          </Text>
          <BotaoGrande titulo="Ativar avisos" onPress={aoPedir} />
        </View>
      );

    case 'negada':
      return (
        <View style={[styles.caixa, styles.alerta]}>
          <Text style={styles.titulo}>Os avisos estão desligados</Text>
          <Text style={styles.texto}>
            Você ainda vê os pedidos nesta tela, mas o celular não vai avisar quando chegar um novo. Para
            ligar, abra as configurações e permita as notificações.
          </Text>
          <BotaoGrande titulo="Abrir configurações" variante="secundario" onPress={aoAbrirConfiguracoes} />
        </View>
      );

    case 'indisponivel':
      return (
        <View style={[styles.caixa, styles.info]}>
          <Text style={styles.texto}>
            Neste aparelho os avisos não estão disponíveis. Os pedidos novos aparecem nesta lista sozinhos.
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  caixa: { borderRadius: raio, borderWidth: 2, padding: espaco.medio, gap: espaco.pequeno },
  info: { borderColor: cores.primario, backgroundColor: cores.sucessoFundo },
  alerta: { borderColor: cores.atencao, backgroundColor: cores.atencaoFundo },
  titulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  texto: { fontSize: fonte.pequena + 1, color: cores.texto, lineHeight: 24 },
});
