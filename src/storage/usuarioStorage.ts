// Leitura e gravação do usuário no celular (AsyncStorage).
// As telas nunca usam o AsyncStorage direto: passam por estas três funções.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Usuario } from '../types';
import { ehUsuario } from '../types/guards';

const CHAVE_USUARIO = '@alethos/usuario/v1';

export async function salvarUsuario(usuario: Usuario): Promise<void> {
  // O AsyncStorage só guarda texto, então o objeto vira JSON.
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function lerUsuario(): Promise<Usuario | null> {
  const texto = await AsyncStorage.getItem(CHAVE_USUARIO);
  if (texto === null) return null;
  try {
    const valor: unknown = JSON.parse(texto); // JSON.parse devolve algo desconhecido...
    return ehUsuario(valor) ? valor : null; // ...que só vira Usuario depois de verificado
  } catch {
    return null;
  }
}

export async function apagarUsuario(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE_USUARIO);
}
