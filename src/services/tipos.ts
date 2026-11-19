import type {
  Analise,
  NovaAnalise,
  NovoCadastro,
  NovoPedido,
  Pedido,
  RespostaPedido,
  Usuario,
} from '../types';

/**
 * O que o app precisa da API. O mock e a API real implementam esta mesma
 * interface, por isso as telas funcionam igual com qualquer um dos dois.
 */
export interface ApiCliente {
  /** Cria a conta. Erro se o telefone já tiver cadastro. */
  cadastrar(dados: NovoCadastro): Promise<Usuario>;
  /** Confere telefone e PIN. Erro "Telefone ou PIN incorreto" se não baterem. */
  autenticar(telefone: string, pin: string): Promise<Usuario>;
  listarAnalises(usuarioId: string): Promise<Analise[]>;
  buscarAnalise(id: string): Promise<Analise>;
  criarAnalise(dados: NovaAnalise): Promise<Analise>;
  listarPedidos(): Promise<Pedido[]>;
  buscarPedidoDaAnalise(analiseId: string): Promise<Pedido | null>;
  criarPedido(dados: NovoPedido): Promise<Pedido>;
  responderPedido(id: string, resposta: RespostaPedido): Promise<Pedido>;
}
