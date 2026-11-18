// Validações PURAS: recebem os dados do formulário e devolvem os erros.
// Não importam nada de React, não mexem em estado nem em rede.
// Mesma entrada, mesma saída, sempre. Por isso são fáceis de testar.

import type { Origem, Perfil } from '../types';
import { ehOrigem, ehPerfil } from '../types/guards';

/** Para cada campo do formulário, uma mensagem de erro (ou nada, se estiver ok). */
export type ErrosDe<T> = Partial<Record<keyof T, string>>;

/** Uma regra recebe o valor do campo e devolve a mensagem de erro, ou null se passou. */
type Regra<V> = (valor: V) => string | null;

// ---------- Regras reutilizáveis ----------

const obrigatorio =
  (mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length === 0 ? mensagem : null;

const minimo =
  (tamanho: number, mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length > 0 && v.trim().length < tamanho ? mensagem : null;

const maximo =
  (tamanho: number, mensagem: string): Regra<string> =>
  (v) =>
    v.trim().length > tamanho ? mensagem : null;

/** Aplica as regras em ordem e devolve o primeiro erro encontrado. */
function primeiroErro<V>(valor: V, regras: Regra<V>[]): string | undefined {
  for (const regra of regras) {
    const erro = regra(valor);
    if (erro) return erro;
  }
  return undefined;
}

/** Remove os campos sem erro, para `Object.keys(erros).length === 0` significar "tudo certo". */
function semVazios<T>(erros: ErrosDe<T>): ErrosDe<T> {
  return Object.fromEntries(
    Object.entries(erros).filter(([, mensagem]) => mensagem !== undefined),
  ) as ErrosDe<T>;
}

export function semErros<T>(erros: ErrosDe<T>): boolean {
  return Object.keys(erros).length === 0;
}

// ---------- Identificação ----------

export const LIMITES_NOME = { minimo: 2, maximo: 60 } as const;

export interface DadosIdentificacao {
  nome: string;
  perfil: Perfil | null;
}

export function validarIdentificacao(dados: DadosIdentificacao): ErrosDe<DadosIdentificacao> {
  return semVazios<DadosIdentificacao>({
    nome: primeiroErro(dados.nome, [
      obrigatorio('Digite seu nome.'),
      minimo(LIMITES_NOME.minimo, 'O nome está muito curto.'),
      maximo(LIMITES_NOME.maximo, `Use no máximo ${LIMITES_NOME.maximo} letras.`),
    ]),
    perfil: ehPerfil(dados.perfil) ? undefined : 'Escolha como você vai usar o app.',
  });
}

// ---------- Nova análise ----------

export const LIMITES_MENSAGEM = { minimo: 10, maximo: 2000 } as const;

export interface DadosNovaAnalise {
  texto: string;
  origem: Origem | null;
}

export function validarNovaAnalise(dados: DadosNovaAnalise): ErrosDe<DadosNovaAnalise> {
  return semVazios<DadosNovaAnalise>({
    texto: primeiroErro(dados.texto, [
      obrigatorio('Cole aqui a mensagem que você recebeu.'),
      minimo(LIMITES_MENSAGEM.minimo, 'A mensagem está muito curta para analisar.'),
      maximo(LIMITES_MENSAGEM.maximo, `Cole no máximo ${LIMITES_MENSAGEM.maximo} caracteres.`),
    ]),
    origem: ehOrigem(dados.origem) ? undefined : 'Escolha por onde a mensagem chegou.',
  });
}
