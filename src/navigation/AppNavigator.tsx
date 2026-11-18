// Navegação em pilha (Native Stack) com fluxo de identificação:
// sem usuário salvo, só existe a tela de identificação; com usuário,
// as telas mudam conforme o perfil (idoso ou familiar).

import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EstadoCarregando } from '../components/Estados';
import { useUsuario } from '../contexts/UsuarioContext';
import { DetalheAnaliseScreen } from '../screens/DetalheAnaliseScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { IdentificacaoScreen } from '../screens/IdentificacaoScreen';
import { NovaAnaliseScreen } from '../screens/NovaAnaliseScreen';
import { PedidosScreen } from '../screens/PedidosScreen';
import { cores, fonte } from '../theme';
import type { RootStackParamList } from './tipos';

const Stack = createNativeStackNavigator<RootStackParamList>();

const tema: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primario,
    background: cores.fundo,
    card: cores.superficie,
    text: cores.texto,
    border: cores.borda,
  },
};

export function AppNavigator() {
  const { usuario, carregando } = useUsuario();

  // Enquanto lê o AsyncStorage, não mostra nenhuma tela (evita "piscar" a identificação).
  if (carregando) return <EstadoCarregando mensagem="Abrindo..." />;

  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontSize: fonte.grande, fontWeight: '700' },
          headerTintColor: cores.primario,
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        {usuario === null ? (
          <Stack.Screen name="Identificacao" component={IdentificacaoScreen} options={{ title: 'Bem-vindo' }} />
        ) : usuario.perfil === 'idoso' ? (
          <>
            <Stack.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Minhas análises' }} />
            <Stack.Screen name="NovaAnalise" component={NovaAnaliseScreen} options={{ title: 'Analisar mensagem' }} />
            <Stack.Screen name="DetalheAnalise" component={DetalheAnaliseScreen} options={{ title: 'Resultado' }} />
          </>
        ) : (
          <Stack.Screen name="Pedidos" component={PedidosScreen} options={{ title: 'Pedidos da família' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
