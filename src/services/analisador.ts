// Analisador por regras: procura sinais de alerta comuns em golpes.
//
// No sistema completo quem decide é o modelo de ML (disciplina de IA), chamado
// pela API. Este analisador serve para duas coisas:
//  1. o modo mock funcionar sem a API;
//  2. explicar o "porquê" em linguagem simples, para o idoso aprender a reconhecer
//     o padrão sozinho em vez de só obedecer a um veredito.
//
// É uma função pura: o mesmo texto sempre gera o mesmo resultado.

import type { Sinal, Veredito } from '../types';

interface Regra extends Sinal {
  peso: number;
  padroes: RegExp[];
}

// Para incluir um sinal novo, basta acrescentar um item neste array.
// Os textos são comparados sem acento e em minúsculas.
export const REGRAS: Regra[] = [
  {
    id: 'dinheiro',
    titulo: 'Pede dinheiro',
    explicacao: 'Fala em Pix, transferência, boleto ou valor. Quase todo golpe termina num pedido de dinheiro.',
    peso: 3,
    padroes: [/\bpix\b/, /transfer/, /deposit/, /boleto/, /r\$\s?\d/, /\d+\s?(mil\s)?reais/, /emprest/, /pagamento/],
  },
  {
    id: 'numero-novo',
    titulo: 'Número novo de alguém conhecido',
    explicacao: 'Golpistas fingem ser parentes que "trocaram de número". Ligue para o número antigo da pessoa.',
    peso: 3,
    padroes: [/troquei (de )?(numero|celular|chip)/, /(meu )?numero novo/, /novo numero/, /salva (esse|este) numero/, /celular (quebrou|caiu)/],
  },
  {
    id: 'dados',
    titulo: 'Pede senha, código ou dados',
    explicacao: 'Banco e empresas sérias nunca pedem senha ou código por mensagem.',
    peso: 3,
    padroes: [/senha/, /codigo/, /\btoken\b/, /\bcpf\b/, /dados bancarios/, /numero do cartao/, /confirme (seus|os) dados/],
  },
  {
    id: 'urgencia',
    titulo: 'Cria pressa',
    explicacao: 'A pressa serve para você não ter tempo de pensar nem de perguntar a alguém.',
    peso: 1, // peso baixo: "hoje" e "agora" também aparecem em mensagens normais
    padroes: [/urgente/, /\bagora\b/, /imediat/, /ultima chance/, /rapido/, /\bhoje\b/, /\b24 ?h/, /expira/],
  },
  {
    id: 'link',
    titulo: 'Tem link',
    explicacao: 'Links podem levar a sites falsos que imitam bancos e lojas. Na dúvida, não clique.',
    peso: 2,
    padroes: [/https?:\/\//, /www\./, /bit\.ly/, /\.com\b/, /clique/, /\blink\b/],
  },
  {
    id: 'ganho-facil',
    titulo: 'Promete ganho fácil',
    explicacao: 'Prêmio inesperado ou lucro alto e rápido é a isca mais antiga que existe.',
    peso: 2,
    padroes: [/voce ganhou/, /premio/, /sorteado/, /\blucro/, /rendimento/, /renda extra/, /dinheiro facil/, /investimento/],
  },
  {
    id: 'segredo',
    titulo: 'Pede segredo',
    explicacao: 'Pedir para não contar a ninguém isola você de quem poderia perceber o golpe.',
    peso: 2,
    padroes: [/nao (conta|fala|comenta)/, /segredo/, /entre nos/],
  },
  {
    id: 'ameaca',
    titulo: 'Faz ameaça',
    explicacao: 'Ameaça de bloqueio, multa ou processo é usada para causar medo.',
    peso: 2,
    padroes: [/bloquead/, /suspens/, /cancelad/, /\bmulta\b/, /processo/, /penhora/],
  },
  {
    id: 'autoridade',
    titulo: 'Diz falar em nome de uma instituição',
    explicacao: 'Golpistas se passam por banco, INSS, Correios ou governo. Confirme pelo telefone oficial.',
    peso: 1,
    padroes: [/\bbanco\b/, /central de/, /gerente/, /\binss\b/, /receita federal/, /correios/, /governo/],
  },
];

/** A partir de quantos pontos cada veredito vale. Do mais grave para o mais leve. */
export const LIMITES: { veredito: Veredito; pontosMinimos: number }[] = [
  { veredito: 'golpe', pontosMinimos: 5 },
  { veredito: 'suspeito', pontosMinimos: 2 },
  { veredito: 'seguro', pontosMinimos: 0 },
];

/** Minúsculas e sem acentos, para "Urgente" e "urgênte" contarem igual. */
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export interface ResultadoAnalise {
  veredito: Veredito;
  pontuacao: number;
  sinais: Sinal[];
}

export function analisarTexto(texto: string): ResultadoAnalise {
  const normalizado = normalizar(texto);
  const encontradas = REGRAS.filter((regra) => regra.padroes.some((p) => p.test(normalizado)));
  const pontuacao = encontradas.reduce((soma, regra) => soma + regra.peso, 0);
  const veredito = LIMITES.find((l) => pontuacao >= l.pontosMinimos)?.veredito ?? 'seguro';
  const sinais = encontradas.map(({ id, titulo, explicacao }) => ({ id, titulo, explicacao }));
  return { veredito, pontuacao, sinais };
}
