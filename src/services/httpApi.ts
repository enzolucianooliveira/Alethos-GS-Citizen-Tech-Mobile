// API real: conversa com o backend de SOA por HTTP.
// Cada resposta chega como `unknown` e só é usada depois de passar pelo guard
// do tipo esperado. Assim o app nunca confia cegamente no JSON recebido.

import type { Analise, NovaAnalise, NovoPedido, Pedido, RespostaPedido } from '../types';
import { ehAnalise, ehListaDe, ehPedido } from '../types/guards';
import { ErroApp } from '../utils';
import { TEMPO_LIMITE_MS, URL_API } from './config';
import type { ApiCliente } from './tipos';

type Guard<T> = (valor: unknown) => valor is T;

/** Uma única função faz todas as requisições: tempo limite, erros e validação. */
async function requisitar<T>(caminho: string, ehValido: Guard<T>, opcoes: RequestInit = {}): Promise<T> {
  const controle = new AbortController();
  const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controle.signal,
    });
  } catch {
    throw new ErroApp('Sem conexão com o servidor. Verifique a internet e tente de novo.');
  } finally {
    clearTimeout(cronometro);
  }

  // fetch NÃO dá erro em 404 ou 500: é preciso conferir `ok` manualmente.
  if (resposta.status === 404) throw new ErroApp('Não encontrei o que você procurava.');
  if (!resposta.ok) throw new ErroApp(`O servidor respondeu com erro (${resposta.status}).`);

  const corpo: unknown = await resposta.json();
  if (!ehValido(corpo)) throw new ErroApp('O servidor respondeu num formato inesperado.');
  return corpo;
}

const comCorpo = (metodo: 'POST' | 'PATCH', corpo: object): RequestInit => ({
  method: metodo,
  body: JSON.stringify(corpo),
});

const ehListaDeAnalises = ehListaDe(ehAnalise);
const ehListaDePedidos = ehListaDe(ehPedido);

export const httpApi: ApiCliente = {
  listarAnalises: (usuarioId) =>
    requisitar(`/analises?usuarioId=${encodeURIComponent(usuarioId)}`, ehListaDeAnalises),

  buscarAnalise: (id) => requisitar(`/analises/${encodeURIComponent(id)}`, ehAnalise),

  criarAnalise: (dados: NovaAnalise): Promise<Analise> =>
    requisitar('/analises', ehAnalise, comCorpo('POST', dados)),

  listarPedidos: () => requisitar('/pedidos', ehListaDePedidos),

  async buscarPedidoDaAnalise(analiseId) {
    const pedidos = await requisitar(
      `/pedidos?analiseId=${encodeURIComponent(analiseId)}`,
      ehListaDePedidos,
    );
    return pedidos[0] ?? null;
  },

  criarPedido: (dados: NovoPedido): Promise<Pedido> =>
    requisitar('/pedidos', ehPedido, comCorpo('POST', dados)),

  responderPedido: (id: string, resposta: RespostaPedido) =>
    requisitar(`/pedidos/${encodeURIComponent(id)}`, ehPedido, comCorpo('PATCH', { status: resposta })),
};
