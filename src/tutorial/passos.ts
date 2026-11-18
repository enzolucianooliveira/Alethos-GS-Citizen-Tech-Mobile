// Os textos do tutorial de cada tela. Para mudar uma dica, ou criar uma nova,
// basta editar estes arrays: nenhuma tela precisa mudar.
//
// `alvo` é o id usado em <AlvoTutorial id="..."> na tela. Sem `alvo`, o balão
// aparece no meio da tela. `opcional: true` pula o passo quando o alvo não
// está na tela naquele momento (ex.: um botão que só aparece às vezes).

import type { HumorGui } from '../components/ilustracoes/Gui';

export interface PassoTutorial {
  alvo?: string;
  titulo: string;
  texto: string;
  opcional?: boolean;
  humor?: HumorGui;
}

export const TUTORIAIS = {
  identificacao: [
    {
      titulo: 'Oi! Eu sou o Gui 👋',
      texto: 'Sou o guardião do Alethos. Vou mostrar rapidinho para que serve cada parte. Toque na tela para passar mais rápido.',
    },
    {
      alvo: 'campo-nome',
      titulo: 'Seu nome',
      texto: 'Escreva como quer ser chamado. Ele fica guardado só neste celular.',
    },
    {
      alvo: 'escolha-perfil',
      titulo: 'Quem é você aqui?',
      texto: 'Recebeu algo estranho? Escolha conferir mensagens. Vai ajudar alguém? Escolha proteger a família.',
    },
    {
      alvo: 'botao-continuar',
      titulo: 'Tudo pronto!',
      texto: 'Toque em Continuar. Da próxima vez o app já vai lembrar de você.',
    },
  ],
  historico: [
    {
      alvo: 'botao-analisar',
      titulo: 'Recebeu algo estranho?',
      texto: 'Toque aqui e cole a mensagem. Eu mostro se ela tem cara de golpe.',
    },
    {
      alvo: 'lista-analises',
      titulo: 'Suas conferências',
      texto: 'Tudo o que você já conferiu fica guardado aqui embaixo. Toque em uma para ver de novo.',
    },
    {
      alvo: 'botao-dicas',
      titulo: 'Esqueceu alguma coisa?',
      texto: 'Toque em Dicas quando quiser e eu explico tudo de novo.',
    },
  ],
  novaAnalise: [
    {
      alvo: 'campo-mensagem',
      titulo: 'Cole a mensagem aqui',
      texto: 'Copie a mensagem no WhatsApp ou no SMS e cole neste espaço. Se foi uma ligação, escreva o que pediram.',
    },
    {
      alvo: 'botao-colar',
      titulo: 'Atalho para colar',
      texto: 'Já copiou a mensagem? Toque aqui que eu colo para você.',
      opcional: true,
    },
    {
      alvo: 'escolha-origem',
      titulo: 'Por onde chegou?',
      texto: 'Escolha de onde veio a mensagem. Isso ajuda a entender o tipo de golpe.',
    },
    {
      alvo: 'botao-conferir',
      titulo: 'Hora de conferir',
      texto: 'Toque em Conferir e veja o resultado na hora.',
    },
  ],
  detalhe: [
    {
      alvo: 'cartao-veredito',
      titulo: 'O resultado',
      texto: 'Vermelho é golpe. Amarelo pede cuidado. Verde parece seguro.',
    },
    {
      alvo: 'botao-ouvir',
      titulo: 'Prefere ouvir?',
      texto: 'Toque aqui e eu leio o resultado em voz alta.',
      opcional: true,
    },
    {
      alvo: 'pedir-familia',
      titulo: 'Na dúvida, chame a família',
      texto: 'Antes de mandar dinheiro, toque aqui. Sua família recebe um aviso e responde se você pode seguir.',
      opcional: true,
    },
    {
      alvo: 'lista-sinais',
      titulo: 'Por que eu acho isso',
      texto: 'Mais abaixo, cada cartão explica um sinal de golpe. Aprenda a reconhecer e se proteja sempre.',
      opcional: true,
    },
  ],
  pedidos: [
    {
      alvo: 'resumo-pedidos',
      titulo: 'Olá, protetor!',
      texto: 'Aqui chegam os pedidos de confirmação de quem você ajuda.',
    },
    {
      alvo: 'aviso-permissao',
      titulo: 'Avisos no celular',
      texto: 'Ative os avisos para o celular tocar quando chegar um pedido novo.',
      opcional: true,
    },
    {
      alvo: 'lista-pedidos',
      titulo: 'Responda com calma',
      texto: 'Se precisar, ligue para a pessoa. Depois toque em Pode seguir ou em Pare, é golpe.',
    },
    {
      alvo: 'botao-simular',
      titulo: 'Modo demonstração',
      texto: 'Sem o botão físico por perto? Use este para simular um pedido chegando.',
      opcional: true,
    },
  ],
} satisfies Record<string, PassoTutorial[]>;

export type ChaveTutorial = keyof typeof TUTORIAIS;
