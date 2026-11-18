// Type guards: funções que verificam, em tempo de execução, se um valor
// desconhecido (`unknown`) tem a forma esperada. É assim que o app trata o JSON
// da API e do AsyncStorage sem usar `any`.

import {
  ORIGENS,
  ORIGENS_PEDIDO,
  PERFIS,
  STATUS_PEDIDO,
  VEREDITOS,
  type Analise,
  type Origem,
  type OrigemPedido,
  type Pedido,
  type Perfil,
  type Sinal,
  type StatusPedido,
  type Usuario,
  type Veredito,
} from './index';

type Registro = Record<string, unknown>;

export function ehObjeto(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function ehTextoOuNulo(valor: unknown): valor is string | null {
  return valor === null || typeof valor === 'string';
}

/** Cria um guard que aceita apenas os valores de uma lista fixa. */
function umDos<T extends string>(valores: readonly T[]) {
  return (valor: unknown): valor is T =>
    typeof valor === 'string' && (valores as readonly string[]).includes(valor);
}

export const ehPerfil = umDos<Perfil>(PERFIS.map((p) => p.valor));
export const ehOrigem = umDos<Origem>(ORIGENS.map((o) => o.valor));
export const ehVeredito = umDos<Veredito>(VEREDITOS);
export const ehStatusPedido = umDos<StatusPedido>(STATUS_PEDIDO);
export const ehOrigemPedido = umDos<OrigemPedido>(ORIGENS_PEDIDO);

/** Transforma o guard de um item no guard de uma lista desses itens. */
export function ehListaDe<T>(ehItem: (valor: unknown) => valor is T) {
  return (valor: unknown): valor is T[] => Array.isArray(valor) && valor.every(ehItem);
}

export function ehUsuario(valor: unknown): valor is Usuario {
  return ehObjeto(valor) && ehTexto(valor.id) && ehTexto(valor.nome) && ehPerfil(valor.perfil);
}

export function ehSinal(valor: unknown): valor is Sinal {
  return (
    ehObjeto(valor) && ehTexto(valor.id) && ehTexto(valor.titulo) && ehTexto(valor.explicacao)
  );
}

export function ehAnalise(valor: unknown): valor is Analise {
  return (
    ehObjeto(valor) &&
    ehTexto(valor.id) &&
    ehTexto(valor.usuarioId) &&
    ehTexto(valor.texto) &&
    ehOrigem(valor.origem) &&
    ehVeredito(valor.veredito) &&
    typeof valor.pontuacao === 'number' &&
    ehListaDe(ehSinal)(valor.sinais) &&
    ehTexto(valor.criadaEm)
  );
}

export function ehPedido(valor: unknown): valor is Pedido {
  return (
    ehObjeto(valor) &&
    ehTexto(valor.id) &&
    ehTextoOuNulo(valor.analiseId) &&
    ehTexto(valor.idosoNome) &&
    ehTexto(valor.descricao) &&
    ehOrigemPedido(valor.origem) &&
    ehStatusPedido(valor.status) &&
    ehTexto(valor.criadoEm) &&
    ehTextoOuNulo(valor.respondidoEm)
  );
}
