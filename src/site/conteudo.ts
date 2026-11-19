// Todo o texto do site de apresentação fica aqui, em arrays.
// Para mudar uma frase, um número ou um integrante, edite só este arquivo.

export const SECOES = [
  { id: 'problema', rotulo: 'O problema' },
  { id: 'como-funciona', rotulo: 'Como funciona' },
  { id: 'familia', rotulo: 'Para a família' },
  { id: 'seguranca', rotulo: 'Segurança' },
] as const;
export type IdSecao = (typeof SECOES)[number]['id'];

export const NUMEROS = [
  { valor: '346 mil', texto: 'estelionatos virtuais registrados no Brasil em 2025: quase 40 por hora' },
  { valor: '+400%', texto: 'de crescimento das fraudes digitais entre 2018 e 2025' },
  { valor: '74,5%', texto: 'dos idosos brasileiros já usam a internet' },
] as const;

export const FONTE_NUMEROS =
  'Fontes: Anuário Brasileiro de Segurança Pública 2026 (FBSP) e IBGE, citados pelo Diário do Comércio.';

export const PASSOS = [
  {
    icone: '📋',
    titulo: 'Cole a mensagem',
    texto: 'Recebeu algo estranho no WhatsApp, SMS ou e-mail? Copie e cole no Alethos.',
  },
  {
    icone: '🛡️',
    titulo: 'Veja os sinais',
    texto: 'O Alethos mostra se parece golpe e explica cada sinal em palavras simples.',
  },
  {
    icone: '📣',
    titulo: 'Chame a família',
    texto: 'Antes de mandar dinheiro, um toque avisa quem você confia. Ela responde na hora.',
  },
] as const;

export const PERFIS_SITE = [
  {
    perfil: 'idoso',
    icone: '🧓',
    titulo: 'Para quem recebe a mensagem',
    itens: [
      'Letras grandes e botões fáceis de tocar',
      'Um guia que explica cada parte da tela',
      'Resultado lido em voz alta',
      'Entrar com um toque, sem senha difícil',
    ],
  },
  {
    perfil: 'familiar',
    icone: '🛡️',
    titulo: 'Para quem protege a família',
    itens: [
      'Aviso no celular quando chega um pedido',
      'Responder "pode seguir" ou "pare, é golpe"',
      'Histórico de todos os pedidos',
      'Funciona também com o botão físico em casa',
    ],
  },
] as const;

export const SEGURANCA = [
  {
    icone: '🔒',
    titulo: 'PIN protegido',
    texto: 'O PIN nunca é guardado como texto: só um código embaralhado (hash) que não dá para desfazer.',
  },
  {
    icone: '🙅',
    titulo: 'Nada de dados do banco',
    texto: 'O Alethos nunca pede senha do banco, CPF ou código recebido por mensagem.',
  },
  {
    icone: '🧠',
    titulo: 'Explica, não só decide',
    texto: 'Cada resultado mostra o porquê. Assim a pessoa aprende a reconhecer o golpe sozinha.',
  },
] as const;

export const EQUIPE = [
  'Enzo Luciano Barros De Oliveira',
  'Alexandre Colvet Delfino',
  'Luigi Thiengo',
  'Pedro Scarceli',
  'Witalon Rodrigues',
] as const;

export const ODS = ['ODS 4: educação de qualidade', 'ODS 10: redução das desigualdades', 'ODS 11: comunidades seguras'] as const;
