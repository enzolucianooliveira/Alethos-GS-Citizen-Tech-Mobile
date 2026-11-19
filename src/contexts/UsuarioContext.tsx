// Estado global com Context API: quem está usando o app (a sessão) e as
// contas lembradas neste celular. Qualquer tela lê isso sem passar por props.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api } from '../services/api';
import { esquecerConta as esquecerNoCelular, lembrarConta, lerContasLembradas } from '../storage/contasStorage';
import { apagarUsuario, lerUsuario, salvarUsuario } from '../storage/usuarioStorage';
import type { NovoCadastro, Usuario } from '../types';

interface ValorUsuarioContext {
  usuario: Usuario | null;
  /** true enquanto lê o AsyncStorage ao abrir o app. */
  carregando: boolean;
  contasLembradas: Usuario[];
  entrar: (telefone: string, pin: string, lembrar: boolean) => Promise<void>;
  cadastrar: (dados: NovoCadastro, lembrar: boolean) => Promise<void>;
  /** Entrar com um toque, usando uma conta lembrada neste celular. */
  entrarComConta: (conta: Usuario) => Promise<void>;
  esquecerConta: (id: string) => Promise<void>;
  /** Sai da conta, mas o celular continua lembrando dela (se foi pedido). */
  sair: () => Promise<void>;
}

const UsuarioContext = createContext<ValorUsuarioContext | null>(null);

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [contasLembradas, setContasLembradas] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app: tem sessão aberta? Isso é a "identificação lembrada ao reabrir".
  useEffect(() => {
    Promise.all([lerUsuario(), lerContasLembradas()])
      .then(([sessao, contas]) => {
        setUsuario(sessao);
        setContasLembradas(contas);
      })
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  /** Abre a sessão e, se pedido, lembra a conta para o "Entrar rápido". */
  const abrirSessao = useCallback(async (conta: Usuario, lembrar: boolean) => {
    await salvarUsuario(conta);
    if (lembrar) setContasLembradas(await lembrarConta(conta));
    setUsuario(conta);
  }, []);

  const entrar = useCallback(
    async (telefone: string, pin: string, lembrar: boolean) => {
      await abrirSessao(await api.autenticar(telefone, pin), lembrar);
    },
    [abrirSessao],
  );

  const cadastrar = useCallback(
    async (dados: NovoCadastro, lembrar: boolean) => {
      await abrirSessao(await api.cadastrar(dados), lembrar);
    },
    [abrirSessao],
  );

  const entrarComConta = useCallback((conta: Usuario) => abrirSessao(conta, true), [abrirSessao]);

  const esquecerConta = useCallback(async (id: string) => {
    setContasLembradas(await esquecerNoCelular(id));
  }, []);

  const sair = useCallback(async () => {
    await apagarUsuario();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, contasLembradas, entrar, cadastrar, entrarComConta, esquecerConta, sair }),
    [usuario, carregando, contasLembradas, entrar, cadastrar, entrarComConta, esquecerConta, sair],
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario(): ValorUsuarioContext {
  const valor = useContext(UsuarioContext);
  if (!valor) throw new Error('useUsuario precisa estar dentro de <UsuarioProvider>.');
  return valor;
}

/** Para telas que só aparecem depois do login: garante que o usuário existe. */
export function useUsuarioLogado(): Usuario {
  const { usuario } = useUsuario();
  if (!usuario) throw new Error('Esta tela só pode aparecer com um usuário identificado.');
  return usuario;
}
