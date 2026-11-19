// Funções pequenas e reutilizáveis, sem nada de tela.

/** Erro com uma mensagem já pronta para mostrar ao usuário. */
export class ErroApp extends Error {
  constructor(mensagemAmigavel: string) {
    super(mensagemAmigavel);
    this.name = 'ErroApp';
    // Garante que `instanceof` funcione em qualquer motor JavaScript ao estender Error.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Telefone ou PIN errados: a tela de entrada conta essas tentativas. */
export class ErroCredenciais extends ErroApp {
  constructor() {
    super('Telefone ou PIN incorreto. Confira e tente de novo.');
    this.name = 'ErroCredenciais';
  }
}

/** Converte qualquer erro (`unknown`) em um texto que o idoso entende. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApp) return erro.message;
  return 'Não foi possível concluir agora. Verifique a internet e tente de novo.';
}

/** Id simples e único o bastante para o protótipo (a API real gera os seus). */
export function gerarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function agoraIso(): string {
  return new Date().toISOString();
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** "17/11/2026 às 16:30". Feito à mão para não depender do suporte a Intl do celular. */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  const dia = `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
  const hora = `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
  return `${dia} às ${hora}`;
}

/** "20:45:12": só o horário, com segundos (para mostrar a última verificação). */
export function formatarHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return [data.getHours(), data.getMinutes(), data.getSeconds()].map(doisDigitos).join(':');
}

/** Tira tudo que não é número: "(11) 98888-0001" vira "11988880001". */
export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Formata enquanto a pessoa digita: "11988880001" vira "(11) 98888-0001". */
export function formatarTelefone(texto: string): string {
  const d = apenasDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = d.length === 11 ? 5 : 4; // celular tem 9 dígitos, fixo tem 8
  return resto.length <= corte ? `(${ddd}) ${resto}` : `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** Esconde o meio do número para mostrar na tela: "(11) •••••-0001". */
export function mascararTelefone(texto: string): string {
  const d = apenasDigitos(texto);
  return d.length < 6 ? d : `(${d.slice(0, 2)}) ${'•'.repeat(d.length - 6)}-${d.slice(-4)}`;
}

/** Corta um texto longo e acrescenta reticências. */
export function resumir(texto: string, limite: number): string {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  return limpo.length <= limite ? limpo : `${limpo.slice(0, limite - 1).trimEnd()}…`;
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
