// Modelos do domínio do app. Todos os outros arquivos importam daqui,
// então este é o "contrato" que precisa bater com o JSON da API.

// ---------- Opções fixas ----------
// Cada lista é declarada uma vez como array "as const" e o tipo é derivado dela.
// Assim, para criar uma opção nova, basta acrescentar um item no array.

export const PERFIS = [
  { valor: 'idoso', rotulo: 'Quero analisar mensagens' },
  { valor: 'familiar', rotulo: 'Quero ajudar um familiar' },
] as const;
export type Perfil = (typeof PERFIS)[number]['valor'];

export const ORIGENS = [
  { valor: 'whatsapp', rotulo: 'WhatsApp' },
  { valor: 'sms', rotulo: 'SMS' },
  { valor: 'ligacao', rotulo: 'Ligação' },
  { valor: 'rede_social', rotulo: 'Rede social' },
  { valor: 'email', rotulo: 'E-mail' },
  { valor: 'outro', rotulo: 'Outro' },
] as const;
export type Origem = (typeof ORIGENS)[number]['valor'];

export const VEREDITOS = ['golpe', 'suspeito', 'seguro'] as const;
export type Veredito = (typeof VEREDITOS)[number];

export const STATUS_PEDIDO = ['pendente', 'aprovado', 'negado'] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];
/** Uma resposta só pode ser "aprovado" ou "negado", nunca "pendente". */
export type RespostaPedido = Exclude<StatusPedido, 'pendente'>;

export const ORIGENS_PEDIDO = ['app', 'dispositivo'] as const;
export type OrigemPedido = (typeof ORIGENS_PEDIDO)[number];

// ---------- Entidades ----------

export interface Usuario {
  id: string;
  nome: string;
  perfil: Perfil;
}

/** Um sinal de alerta encontrado na mensagem, com a explicação para o idoso. */
export interface Sinal {
  id: string;
  titulo: string;
  explicacao: string;
}

export interface Analise {
  id: string;
  usuarioId: string;
  texto: string;
  origem: Origem;
  veredito: Veredito;
  pontuacao: number;
  sinais: Sinal[];
  criadaEm: string; // data em ISO 8601, como vem da API
}

/** O que o formulário envia. A API completa o resto (id, veredito, sinais...). */
export interface NovaAnalise {
  usuarioId: string;
  texto: string;
  origem: Origem;
}

export interface Pedido {
  id: string;
  analiseId: string | null; // null quando o pedido vem do botão físico (ESP32)
  idosoNome: string;
  descricao: string;
  origem: OrigemPedido;
  status: StatusPedido;
  criadoEm: string;
  respondidoEm: string | null;
}

export interface NovoPedido {
  analiseId: string | null;
  idosoNome: string;
  descricao: string;
  origem: OrigemPedido;
}

// ---------- Estado de uma tela que carrega dados ----------
// Union discriminado: a tela está em exatamente UM destes estados.
// Dentro de `if (estado.status === 'sucesso')` o TypeScript sabe que `dados` existe.

export type EstadoTela<T> =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'sucesso'; dados: T };
