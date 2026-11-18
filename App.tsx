import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UsuarioProvider } from './src/contexts/UsuarioContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { configurarNotificacoes } from './src/services/notificacoes';

// Define, uma única vez, como as notificações aparecem com o app aberto.
configurarNotificacoes();

export default function App() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}
