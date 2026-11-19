import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MolduraWeb } from './src/components/MolduraWeb';
import { UsuarioProvider } from './src/contexts/UsuarioContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { configurarNotificacoes } from './src/services/notificacoes';
import { cores } from './src/theme';
import { TutorialProvider } from './src/tutorial/TutorialContext';

// Define, uma única vez, como as notificações aparecem com o app aberto.
configurarNotificacoes();

export default function App() {
  // Os nomes das fontes aqui são os mesmos usados em `familias` no tema.
  const [fontesProntas, erroFontes] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  // Espera as fontes (ou segue com a do sistema, se falharem) para não "pular" o visual.
  if (!fontesProntas && !erroFontes) return <View style={{ flex: 1, backgroundColor: cores.fundo }} />;

  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <MolduraWeb>
          <TutorialProvider>
            <AppNavigator />
          </TutorialProvider>
        </MolduraWeb>
        <StatusBar style="light" />
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}
