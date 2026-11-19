// Navegação em pilha (Native Stack) com fluxo de login:
// sem sessão aberta, só existem Entrar e Cadastro; com sessão,
// as telas mudam conforme o perfil (idoso ou familiar).

import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EstadoCarregando } from '../components/Estados';
import { useUsuario } from '../contexts/UsuarioContext';
import { DetalheAnaliseScreen } from '../screens/DetalheAnaliseScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { EntrarScreen } from '../screens/EntrarScreen';
import { NovaAnaliseScreen } from '../screens/NovaAnaliseScreen';
import { PedidosScreen } from '../screens/PedidosScreen';
import { cores, familias, fonte } from '../theme';
import { useTema } from '../theme/useTema';
import type { RootStackParamList } from './tipos';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Telas com cabeçalho colorido próprio escondem a barra padrão.
const SEM_BARRA = { headerShown: false } as const;

export function AppNavigator() {
  const { usuario, carregando } = useUsuario();
  const tema = useTema();

  // Enquanto lê o AsyncStorage, não mostra nenhuma tela (evita "piscar" a identificação).
  if (carregando) return <EstadoCarregando mensagem="Abrindo..." />;

  const temaNavegacao: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: tema.principal,
      background: tema.fundo[0],
      card: tema.principal,
      text: cores.branco,
      border: tema.escuro,
    },
  };

  return (
    <NavigationContainer theme={temaNavegacao}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: tema.principal },
          headerTintColor: cores.branco,
          headerTitleStyle: { fontFamily: familias.titulo, fontSize: fonte.grande },
          headerBackTitle: 'Voltar',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: tema.fundo[0] },
        }}
      >
        {usuario === null ? (
          <>
            <Stack.Screen name="Entrar" component={EntrarScreen} options={SEM_BARRA} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
          </>
        ) : usuario.perfil === 'idoso' ? (
          <>
            <Stack.Screen name="Historico" component={HistoricoScreen} options={SEM_BARRA} />
            <Stack.Screen name="NovaAnalise" component={NovaAnaliseScreen} options={{ title: 'Conferir mensagem' }} />
            <Stack.Screen name="DetalheAnalise" component={DetalheAnaliseScreen} options={{ title: 'Resultado' }} />
          </>
        ) : (
          <Stack.Screen name="Pedidos" component={PedidosScreen} options={SEM_BARRA} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
