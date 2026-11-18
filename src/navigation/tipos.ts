// O "mapa" de rotas do app: cada tela e o que ela recebe.
// `undefined` = a tela não recebe parâmetro.

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Identificacao: undefined;
  Historico: undefined;
  NovaAnalise: undefined;
  DetalheAnalise: { id: string }; // só o id: a tela busca o resto
  Pedidos: undefined;
};

/** Atalho para tipar as props de uma tela: `TelaProps<'DetalheAnalise'>`. */
export type TelaProps<Nome extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Nome
>;

// Isto ensina o TypeScript sobre as rotas no app inteiro, inclusive no useNavigation().
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
