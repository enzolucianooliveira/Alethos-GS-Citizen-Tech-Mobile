// Todas as cores, tamanhos e espaçamentos do app ficam aqui.
// Pensado para idosos: fonte grande, contraste alto e áreas de toque largas.

import type { Veredito } from '../types';

export const cores = {
  fundo: '#F6F4EF',
  superficie: '#FFFFFF',
  texto: '#1B1A17',
  textoSuave: '#4A4640',
  borda: '#BDB7AA',
  primario: '#1F5C4A',
  primarioTexto: '#FFFFFF',
  perigo: '#A4231B',
  perigoFundo: '#FBE8E6',
  atencao: '#7A4E00',
  atencaoFundo: '#FFF2D1',
  sucesso: '#1D6A33',
  sucessoFundo: '#E4F3E8',
} as const;

export const fonte = {
  pequena: 16,
  normal: 19,
  grande: 23,
  titulo: 28,
} as const;

export const espaco = {
  xs: 4,
  pequeno: 8,
  medio: 16,
  grande: 24,
  enorme: 32,
} as const;

export const raio = 12;
export const alturaToque = 60; // altura mínima de botões e campos

/** Como cada veredito aparece na tela. Mudar um texto aqui muda o app inteiro. */
export const aparenciaVeredito: Record<
  Veredito,
  { rotulo: string; simbolo: string; cor: string; fundo: string; conselho: string }
> = {
  golpe: {
    rotulo: 'Parece golpe',
    simbolo: '!',
    cor: cores.perigo,
    fundo: cores.perigoFundo,
    conselho:
      'Não responda, não clique em links e não envie dinheiro. Ligue para a pessoa no número que você já conhece ou peça para sua família confirmar.',
  },
  suspeito: {
    rotulo: 'Tenha cuidado',
    simbolo: '?',
    cor: cores.atencao,
    fundo: cores.atencaoFundo,
    conselho:
      'A mensagem tem alguns sinais de alerta. Antes de fazer qualquer coisa, confirme por outro caminho com quem diz ter enviado.',
  },
  seguro: {
    rotulo: 'Parece seguro',
    simbolo: '✓',
    cor: cores.sucesso,
    fundo: cores.sucessoFundo,
    conselho:
      'Não encontramos sinais comuns de golpe. Mesmo assim, se pedirem dinheiro ou senha, confirme antes.',
  },
};
