// Cuida da permissão de notificação: consulta ao abrir, permite pedir,
// e consulta de novo quando o usuário volta das configurações do celular.

import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  abrirConfiguracoes,
  consultarPermissao,
  pedirPermissao,
  type SituacaoPermissao,
} from '../services/notificacoes';

export function usePermissaoNotificacao() {
  const [situacao, setSituacao] = useState<SituacaoPermissao>('verificando');

  const verificar = useCallback(async () => {
    try {
      setSituacao(await consultarPermissao());
    } catch {
      setSituacao('indisponivel');
    }
  }, []);

  const pedir = useCallback(async () => {
    try {
      setSituacao(await pedirPermissao());
    } catch {
      setSituacao('indisponivel');
    }
  }, []);

  useEffect(() => {
    void verificar();
    // Quem negou e foi nas configurações ligar a permissão volta para o app:
    // nesse momento verificamos de novo, sem precisar reiniciar nada.
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void verificar();
    });
    return () => inscricao.remove();
  }, [verificar]);

  return { situacao, pedir, abrirConfiguracoes };
}
