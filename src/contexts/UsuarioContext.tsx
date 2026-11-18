// Estado global com Context API: qualquer tela sabe quem é o usuário,
// sem precisar passar isso por props de tela em tela.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { apagarUsuario, lerUsuario, salvarUsuario } from '../storage/usuarioStorage';
import type { Perfil, Usuario } from '../types';
import { gerarId } from '../utils';

interface ValorUsuarioContext {
  usuario: Usuario | null;
  /** true enquanto lê o AsyncStorage ao abrir o app. */
  carregando: boolean;
  entrar: (nome: string, perfil: Perfil) => Promise<void>;
  sair: () => Promise<void>;
}

const UsuarioContext = createContext<ValorUsuarioContext | null>(null);

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app: existe alguém salvo? Isso é a "identificação lembrada".
  useEffect(() => {
    lerUsuario()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (nome: string, perfil: Perfil) => {
    const novo: Usuario = { id: gerarId(), nome: nome.trim(), perfil };
    await salvarUsuario(novo);
    setUsuario(novo);
  }, []);

  const sair = useCallback(async () => {
    await apagarUsuario();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair }),
    [usuario, carregando, entrar, sair],
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario(): ValorUsuarioContext {
  const valor = useContext(UsuarioContext);
  if (!valor) throw new Error('useUsuario precisa estar dentro de <UsuarioProvider>.');
  return valor;
}

/** Para telas que só aparecem depois da identificação: garante que o usuário existe. */
export function useUsuarioLogado(): Usuario {
  const { usuario } = useUsuario();
  if (!usuario) throw new Error('Esta tela só pode aparecer com um usuário identificado.');
  return usuario;
}
