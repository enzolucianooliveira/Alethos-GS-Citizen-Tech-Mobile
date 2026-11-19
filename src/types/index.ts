// Modelos do domínio do app. Todos os outros arquivos importam daqui,
// então este é o "contrato" que precisa bater com o JSON da API.

// ---------- Opções fixas ----------
// Cada lista é declarada uma vez como array "as const" e o tipo é derivado dela.
// Assim, para criar uma opção nova, basta acrescentar um item no array.

export const PERFIS = [
  {
    valor: 'idoso',
    rotulo: 'Quero conferir mensagens',
    descricao: 'Recebi algo estranho e quero saber se é golpe.',
    icone: '🧓',
  },
  {
    valor: 'familiar',
    rotulo: 'Quero proteger minha família',
    descricao: 'Vou confirmar os pedidos de quem eu ajudo.',
    icone: '🛡️',
  },
] as const;
export type Perfil = (typeof PERFIS)[number]['valor'];

export const ORIGENS = [
  { valor: 'whatsapp', rotulo: 'WhatsApp', icone: '💬' },
  { valor: 'sms', rotulo: 'SMS', icone: '✉️' },
  { valor: 'ligacao', rotulo: 'Ligação', icone: '📞' },
  { valor: 'rede_social', rotulo: 'Rede social', icone: '👥' },
  { valor: 'email', rotulo: 'E-mail', icone: '📧' },
  { valor: 'outro', rotulo: 'Outro', icone: '❔' },
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

/** Quem está usando o app. Nunca carrega o PIN, nem em forma de hash. */
export interface Usuario {
  id: string;
  nome: string;
  telefone: string; // só dígitos, com DDD
  perfil: Perfil;
}

/** O que o formulário de cadastro envia para a API. */
export interface NovoCadastro {
  nome: string;
  telefone: string;
  perfil: Perfil;
  pin: string;
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
