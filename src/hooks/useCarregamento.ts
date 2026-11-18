// Hook genérico para qualquer tela que carrega dados.
// Recebe a função que busca os dados e devolve o estado da tela
// (carregando, erro ou sucesso), já recarregando sempre que a tela volta ao foco.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import type { EstadoTela } from '../types';
import { mensagemDeErro } from '../utils';

export function useCarregamento<T>(carregar: () => Promise<T>) {
  const [estado, setEstado] = useState<EstadoTela<T>>({ status: 'carregando' });

  const recarregar = useCallback(async () => {
    // Se já há dados na tela, atualiza "por baixo" sem piscar o carregando.
    setEstado((atual) => (atual.status === 'sucesso' ? atual : { status: 'carregando' }));
    try {
      const dados = await carregar();
      setEstado({ status: 'sucesso', dados });
    } catch (erro: unknown) {
      setEstado({ status: 'erro', mensagem: mensagemDeErro(erro) });
    }
  }, [carregar]);

  /** Força o estado "carregando" (usado pelo botão Tentar de novo). */
  const tentarDeNovo = useCallback(() => {
    setEstado({ status: 'carregando' });
    void recarregar();
  }, [recarregar]);

  /** Troca os dados sem passar pelo carregando (ex.: depois da consulta periódica). */
  const substituirDados = useCallback((dados: T) => setEstado({ status: 'sucesso', dados }), []);

  // Recarrega ao abrir a tela e sempre que o usuário voltar para ela.
  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  return { estado, recarregar, tentarDeNovo, substituirDados };
}
