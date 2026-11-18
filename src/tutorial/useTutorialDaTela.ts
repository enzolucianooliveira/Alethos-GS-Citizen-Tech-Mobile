// Liga o tutorial de uma tela: aparece sozinho na primeira visita e pode ser
// reaberto pelo botão "Dicas".

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { jaViuTutorial } from '../storage/tutorialStorage';
import { TUTORIAIS, type ChaveTutorial } from './passos';
import { useTutorial } from './TutorialContext';

/** Espera a tela terminar de desenhar antes de medir os alvos. */
const ATRASO_INICIO_MS = 900;

/**
 * @param pronto false enquanto a tela ainda carrega dados (os alvos não existem ainda).
 */
export function useTutorialDaTela(chave: ChaveTutorial, pronto = true) {
  const { iniciar, parar } = useTutorial();

  const rever = useCallback(() => iniciar(chave, TUTORIAIS[chave]), [chave, iniciar]);

  useFocusEffect(
    useCallback(() => {
      if (!pronto) return;
      let cancelado = false;
      const cronometro = setTimeout(() => {
        void jaViuTutorial(chave).then((viu) => {
          if (!viu && !cancelado) iniciar(chave, TUTORIAIS[chave]);
        });
      }, ATRASO_INICIO_MS);

      // Saiu da tela: cancela o que estava para aparecer e fecha o tutorial dela.
      return () => {
        cancelado = true;
        clearTimeout(cronometro);
        parar(chave);
      };
    }, [pronto, chave, iniciar, parar]),
  );

  return { rever };
}
