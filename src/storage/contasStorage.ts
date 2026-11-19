// Contas lembradas neste celular, para entrar com um toque.
// Guarda só nome, telefone e perfil: o PIN nunca vem para cá.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Usuario } from '../types';
import { ehListaDe, ehUsuario } from '../types/guards';

const CHAVE_CONTAS = '@alethos/contas-lembradas/v1';
/** Quantas contas o celular lembra no máximo (as mais recentes ficam). */
export const MAXIMO_CONTAS = 5;

export async function lerContasLembradas(): Promise<Usuario[]> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE_CONTAS);
    if (texto === null) return [];
    const valor: unknown = JSON.parse(texto);
    return ehListaDe(ehUsuario)(valor) ? valor : [];
  } catch {
    return [];
  }
}

async function gravar(contas: Usuario[]): Promise<Usuario[]> {
  await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
  return contas;
}

/** Coloca a conta no topo da lista (sem repetir) e devolve a lista nova. */
export async function lembrarConta(usuario: Usuario): Promise<Usuario[]> {
  const atuais = await lerContasLembradas();
  return gravar([usuario, ...atuais.filter((c) => c.id !== usuario.id)].slice(0, MAXIMO_CONTAS));
}

export async function esquecerConta(id: string): Promise<Usuario[]> {
  const atuais = await lerContasLembradas();
  return gravar(atuais.filter((c) => c.id !== id));
}
