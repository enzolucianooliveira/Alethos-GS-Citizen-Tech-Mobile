// Os três estados de qualquer tela que busca dados, em um lugar só.
// O mascote Gui aparece em cada um, para a tela nunca ficar "vazia".

import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { cores, espaco } from '../theme';
import { useTema } from '../theme/useTema';
import type { EstadoTela } from '../types';
import { BotaoGrande } from './BotaoGrande';
import { Gui } from './ilustracoes/Gui';
import { FundoColorido } from './Layout';
import { Texto } from './Texto';

export function EstadoCarregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  const tema = useTema();
  return (
    <FundoColorido>
      <View style={styles.centro} accessibilityLiveRegion="polite">
        <Gui tamanho={110} />
        <ActivityIndicator size="large" color={tema.principal} />
        <Texto variante="destaque" cor={cores.textoSuave} centro>
          {mensagem}
        </Texto>
      </View>
    </FundoColorido>
  );
}

export function EstadoErro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo: () => void }) {
  return (
    <FundoColorido>
      <View style={styles.centro} accessibilityLiveRegion="assertive">
        <Gui tamanho={110} humor="alerta" />
        <Texto variante="titulo" centro>
          Opa, algo deu errado
        </Texto>
        <Texto cor={cores.textoSuave} centro>
          {mensagem}
        </Texto>
        <BotaoGrande titulo="Tentar de novo" icone="🔄" onPress={aoTentarDeNovo} />
      </View>
    </FundoColorido>
  );
}

export function EstadoVazio({ titulo, mensagem, ilustracao }: { titulo: string; mensagem: string; ilustracao?: ReactNode }) {
  return (
    <View style={styles.vazio}>
      {ilustracao ?? <Gui tamanho={96} />}
      <Texto variante="subtitulo" centro>
        {titulo}
      </Texto>
      <Texto cor={cores.textoSuave} centro>
        {mensagem}
      </Texto>
    </View>
  );
}

/**
 * Componente genérico: recebe o estado e só chama `children` com os dados
 * quando eles existem. O TypeScript sabe o tipo de `dados` dentro da função.
 */
export function ConteudoComEstado<T>({
  estado,
  aoTentarDeNovo,
  children,
}: {
  estado: EstadoTela<T>;
  aoTentarDeNovo: () => void;
  children: (dados: T) => ReactNode;
}) {
  switch (estado.status) {
    case 'carregando':
      return <EstadoCarregando />;
    case 'erro':
      return <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={aoTentarDeNovo} />;
    case 'sucesso':
      return <>{children(estado.dados)}</>;
  }
}

const styles = StyleSheet.create({
  centro: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.medio,
    padding: espaco.grande,
  },
  vazio: { alignItems: 'center', gap: espaco.pequeno, paddingVertical: espaco.grande, paddingHorizontal: espaco.medio },
});
