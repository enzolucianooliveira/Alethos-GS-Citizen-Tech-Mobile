// Identidade visual do Alethos. Todas as cores, fontes e medidas ficam aqui.
//
// Pensado para idosos:
// - Atkinson Hyperlegible no texto: fonte criada pelo Braille Institute para
//   pessoas com baixa visão (letras como I, l e 1 não se confundem).
// - Baloo 2 nos títulos: arredondada, forte e amigável.
// - Cores quentes e saturadas, sempre com contraste alto para o texto.
// - Cada perfil tem sua cor: laranja para quem analisa, roxo para a família.

import type { Perfil, Veredito } from '../types';

export const familias = {
  titulo: 'Baloo2_800ExtraBold',
  tituloMedio: 'Baloo2_700Bold',
  corpo: 'AtkinsonHyperlegible_400Regular',
  corpoNegrito: 'AtkinsonHyperlegible_700Bold',
} as const;

export const cores = {
  fundo: '#FFF7EC',
  superficie: '#FFFFFF',
  texto: '#2A1E17',
  textoSuave: '#5E4B3C',
  borda: '#E9D8C4',
  bordaForte: '#C9AE90',
  branco: '#FFFFFF',
  sol: '#FFC93C',
  sombra: '#5A2E0E',
  veu: 'rgba(28, 16, 8, 0.74)', // fundo escurecido do tutorial
  perigo: '#C62828',
  perigoFundo: '#FFE5E3',
  atencao: '#B45309',
  atencaoFundo: '#FFF1CC',
  sucesso: '#1B7A3D',
  sucessoFundo: '#DFF5E6',
} as const;

/** Paleta de cada perfil. As telas pegam a do usuário atual com `useTema()`. */
export interface PaletaPerfil {
  principal: string; // botões e destaques (contraste alto com branco)
  escuro: string; // texto sobre o claro
  claro: string; // fundos suaves
  gradiente: readonly [string, string]; // faixa do cabeçalho
  fundo: readonly [string, string, string]; // degradê do fundo das telas
  bolha: string; // cor das bolhas decorativas do fundo
}

export const paletas: Record<Perfil, PaletaPerfil> = {
  idoso: {
    principal: '#C2410C',
    escuro: '#7C2D12',
    claro: '#FFE3D1',
    gradiente: ['#FF8A3D', '#C2410C'],
    fundo: ['#FFE7B8', '#FFC9A8', '#FFB3C1'], // amarelo sol, pêssego e coral
    bolha: '#FF8A3D',
  },
  familiar: {
    principal: '#6D28D9',
    escuro: '#3B0F7A',
    claro: '#EDE4FF',
    gradiente: ['#9B6BFF', '#5B21B6'],
    fundo: ['#E3D7FF', '#F1C9F2', '#FFC4DC'], // lavanda, lilás e rosa
    bolha: '#9B6BFF',
  },
};

export const fonte = {
  pequena: 17,
  normal: 20,
  grande: 24,
  titulo: 30,
  enorme: 38,
} as const;

export const espaco = { xs: 4, pequeno: 8, medio: 16, grande: 24, enorme: 32 } as const;

export const raio = { pequeno: 12, medio: 20, grande: 28 } as const;
export const alturaToque = 64; // altura mínima de botões e campos

/** Sombra suave padrão, já no formato que o React Native espera. */
export const sombra = {
  shadowColor: cores.sombra,
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

/** Como cada veredito aparece. Mudar um texto aqui muda o app inteiro. */
export const aparenciaVeredito: Record<
  Veredito,
  { rotulo: string; frase: string; cor: string; fundo: string; conselho: string }
> = {
  golpe: {
    rotulo: 'Parece golpe',
    frase: 'Pare agora. Não responda.',
    cor: cores.perigo,
    fundo: cores.perigoFundo,
    conselho:
      'Não responda, não clique em links e não envie dinheiro. Ligue para a pessoa no número que você já conhece ou peça para sua família confirmar.',
  },
  suspeito: {
    rotulo: 'Tenha cuidado',
    frase: 'Confirme antes de agir.',
    cor: cores.atencao,
    fundo: cores.atencaoFundo,
    conselho:
      'A mensagem tem alguns sinais de alerta. Antes de fazer qualquer coisa, confirme por outro caminho com quem diz ter enviado.',
  },
  seguro: {
    rotulo: 'Parece seguro',
    frase: 'Nenhum sinal comum de golpe.',
    cor: cores.sucesso,
    fundo: cores.sucessoFundo,
    conselho:
      'Não encontramos sinais comuns de golpe. Mesmo assim, se pedirem dinheiro ou senha, confirme antes.',
  },
};

/** Um desenho (emoji) para cada sinal de alerta, pelo id da regra. */
export const ICONES_SINAL: Record<string, string> = {
  dinheiro: '💸',
  'numero-novo': '📱',
  dados: '🔑',
  urgencia: '⏰',
  link: '🔗',
  'ganho-facil': '🎁',
  segredo: '🤫',
  ameaca: '⚠️',
  autoridade: '🏦',
};
export const ICONE_SINAL_PADRAO = '🚩';
