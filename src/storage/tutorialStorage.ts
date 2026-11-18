// Guarda quais tutoriais a pessoa já viu, para não repetir toda vez.

import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = '@antigolpe/tutoriais-vistos/v1';

function ehListaDeTextos(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === 'string');
}

async function lerVistos(): Promise<string[]> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE);
    if (texto === null) return [];
    const valor: unknown = JSON.parse(texto);
    return ehListaDeTextos(valor) ? valor : [];
  } catch {
    return [];
  }
}

export async function jaViuTutorial(chave: string): Promise<boolean> {
  return (await lerVistos()).includes(chave);
}

export async function marcarTutorialVisto(chave: string): Promise<void> {
  const vistos = await lerVistos();
  if (vistos.includes(chave)) return;
  await AsyncStorage.setItem(CHAVE, JSON.stringify([...vistos, chave]));
}
