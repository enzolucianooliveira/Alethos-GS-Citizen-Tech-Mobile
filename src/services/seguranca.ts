// Proteção do PIN. O PIN nunca é guardado como texto: guardamos um "sal"
// aleatório e o hash SHA-256 de (sal + PIN). Para conferir no login, refazemos
// o hash com o mesmo sal e comparamos. Quem abrir o banco não descobre o PIN.
//
// No sistema completo isso acontece na API (servidor). Aqui o mock faz o mesmo
// papel, para o app funcionar sem o backend.

import * as Crypto from 'expo-crypto';

export function gerarSal(): string {
  return Crypto.randomUUID();
}

export function hashDoPin(sal: string, pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${sal}:${pin}`);
}
