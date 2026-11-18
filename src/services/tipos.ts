import type { Analise, NovaAnalise, NovoPedido, Pedido, RespostaPedido } from '../types';

/**
 * O que o app precisa da API. O mock e a API real implementam esta mesma
 * interface, por isso as telas funcionam igual com qualquer um dos dois.
 */
export interface ApiCliente {
  listarAnalises(usuarioId: string): Promise<Analise[]>;
  buscarAnalise(id: string): Promise<Analise>;
  criarAnalise(dados: NovaAnalise): Promise<Analise>;
  listarPedidos(): Promise<Pedido[]>;
  buscarPedidoDaAnalise(analiseId: string): Promise<Pedido | null>;
  criarPedido(dados: NovoPedido): Promise<Pedido>;
  responderPedido(id: string, resposta: RespostaPedido): Promise<Pedido>;
}
