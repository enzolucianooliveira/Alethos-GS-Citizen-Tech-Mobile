// Funções pequenas e reutilizáveis, sem nada de tela.

/** Erro com uma mensagem já pronta para mostrar ao usuário. */
export class ErroApp extends Error {
  constructor(mensagemAmigavel: string) {
    super(mensagemAmigavel);
    this.name = 'ErroApp';
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

/** Corta um texto longo e acrescenta reticências. */
export function resumir(texto: string, limite: number): string {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  return limpo.length <= limite ? limpo : `${limpo.slice(0, limite - 1).trimEnd()}…`;
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
