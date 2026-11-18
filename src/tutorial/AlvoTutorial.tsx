import { useCallback, type ComponentRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTutorial } from './TutorialContext';

/**
 * Marca uma parte da tela para o tutorial apontar.
 * Ex.: <AlvoTutorial id="botao-analisar"><BotaoGrande ... /></AlvoTutorial>
 */
export function AlvoTutorial({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { registrarAlvo } = useTutorial();
  // Ao montar, o React entrega o componente; ao desmontar, entrega null.
  const ref = useCallback((no: ComponentRef<typeof View> | null) => registrarAlvo(id, no), [id, registrarAlvo]);
  return (
    // collapsable={false}: no Android, garante que a View exista de verdade para ser medida.
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
