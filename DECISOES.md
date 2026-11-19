# Decisões do app mobile

## Navegação: React Navigation com Native Stack
É a biblioteca usada no material da disciplina. O app tem um fluxo de identificação: sem usuário salvo existe só a tela de identificação; com usuário, as telas mudam conforme o perfil (idoso ou familiar). As rotas são tipadas em `src/navigation/tipos.ts`, e a tela de detalhe recebe apenas o `id` da análise e busca o resto, para não trafegar objetos inteiros nem mostrar dados desatualizados.

## Login com telefone e PIN, e "Entrar rápido"
Idosos costumam ter dificuldade com e-mail e senha longa. Por isso o login usa o telefone com DDD, que todo mundo sabe de cor, e um PIN de 4 números, como a senha do cartão.
- **Segurança do PIN:** ele nunca é guardado como texto. Guardamos um sal aleatório e o hash SHA-256 de (sal + PIN), com `expo-crypto`. No sistema completo isso fica na API.
- **Mesma mensagem para telefone inexistente e PIN errado:** assim ninguém descobre quais telefones têm conta tentando no login.
- **PINs fáceis bloqueados** (1234, 0000, 1111...) e **bloqueio de 30 segundos** depois de 5 erros seguidos. O bloqueio no app é uma camada a mais; a API também deve limitar as tentativas (resposta 429).
- **Entrar rápido:** o celular lembra até 5 contas (só nome, telefone e perfil, nunca o PIN). Um toque no nome entra na conta. Isso resolve o caso do idoso e do familiar que usam o mesmo celular, e cada conta pode ser esquecida com um toque.

## Dois perfis no mesmo app
O problema envolve duas pessoas: quem recebe o golpe e quem ajuda a conferir. Um app com dois perfis evita manter dois projetos e permite demonstrar o ciclo completo em um único celular.

## Camada de services com mock
As telas só chamam `api` (`src/services/api.ts`). O mock e a API HTTP implementam a mesma interface `ApiCliente`, então trocar de um para o outro é mudar uma constante em `config.ts`. O mock grava os dados no AsyncStorage para que o app funcione e seja demonstrável mesmo sem o backend no ar.

## Respostas da API validadas em tempo de execução
Tudo que chega da rede ou do AsyncStorage é tratado como `unknown` e só é usado depois de passar por um type guard (`src/types/guards.ts`). Assim o projeto não usa `any` e não confia cegamente no JSON recebido.

## Estado das telas como union
`EstadoTela<T>` só pode ser carregando, erro ou sucesso. O hook genérico `useCarregamento` concentra essa lógica e recarrega os dados quando a tela volta ao foco, o que faz o item novo aparecer na lista logo depois de criado.

## Validação pura
As regras ficam em `src/validation/` como funções que recebem os dados e devolvem os erros, sem React. As regras pequenas (obrigatório, mínimo, máximo) são reutilizadas pelos dois formulários.

## Analisador por regras no app
No sistema completo, o veredito vem do modelo de ML pela API. O app também tem um analisador por regras (`src/services/analisador.ts`), usado pelo mock, que explica cada sinal de alerta em linguagem simples. A ideia é que o idoso aprenda a reconhecer o padrão sozinho, e não só obedeça a uma resposta pronta. As regras e os pesos ficam em arrays, então incluir um sinal novo é acrescentar um item.

## Recurso nativo: notificação local
O familiar recebe uma notificação local quando surge um pedido novo. Push remoto não funciona no Expo Go para Android desde o SDK 53, por isso o app consulta a API periodicamente (a cada 5 segundos) e dispara a notificação localmente. A permissão é tratada nos três casos: concedida, ainda pode ser pedida (com explicação antes de pedir) e negada (aviso no app e atalho para as configurações). O app continua funcionando sem a permissão.

**Limitação assumida:** a consulta só acontece com o app aberto. Para avisar com o app fechado seria preciso push e um development build, o que ficou fora do escopo.

## Identidade visual pensada para idosos
- **Fontes:** Atkinson Hyperlegible no texto, criada pelo Braille Institute para baixa visão (I, l e 1 não se confundem, o zero é cortado). Baloo 2 nos títulos, arredondada e forte.
- **Cores por perfil:** laranja para quem confere mensagens e roxo para a família. A pessoa sabe "onde está" só pela cor. O resultado usa vermelho, amarelo e verde, como um semáforo.
- **Ilustrações próprias em SVG:** o mascote Alethos (um guardião grego), o celular com alerta e a família foram desenhados em código. São vetores, então ficam nítidos em qualquer tela, não pesam e não dependem de imagens de terceiros.
- **Toque fácil:** botões com 64 pontos de altura e um "degrau" embaixo, que deixa claro que são apertáveis. Emojis nos sinais e nas opções ajudam quem lê com dificuldade.
- Tudo fica em `src/theme/`, e o texto passa pelo componente `Texto`, para o padrão valer no app inteiro.

## Tutorial guiado (estilo jogo)
Na primeira visita de cada tela, o fundo escurece, um recorte ilumina a parte explicada e o mascote Alethos aparece num balão com uma seta apontando para ela. Cada dica some sozinha em 7 segundos, com uma barrinha mostrando o tempo, e passa na hora com um toque. Há "Pular", "Ouvir" (lê a dica em voz alta) e o botão "Dicas" para rever.
- As telas só marcam as partes com `<AlvoTutorial id="...">`; os textos ficam em arrays em `src/tutorial/passos.ts`. Mudar uma dica não exige mexer em tela nenhuma.
- A posição é medida com `measureInWindow`. Se a parte estiver fora da tela, o balão aparece no centro. Passos marcados como opcionais são pulados quando a parte não existe naquele momento.
- O que já foi visto fica salvo no AsyncStorage, para não repetir a cada abertura.

## Voz e colar
"Ouvir em voz alta" (expo-speech) lê o resultado para quem tem dificuldade de leitura. "Colar mensagem copiada" (expo-clipboard) evita o gesto de segurar o dedo no campo, que muitos idosos não conhecem. Nenhum dos dois pede permissão.

## Privacidade
O celular guarda apenas nome, telefone e perfil das contas lembradas. O PIN só existe como hash. O app nunca pede senha do banco, CPF ou dados bancários.

## Fora do escopo por tempo
Vínculo real entre idoso e familiar (hoje o familiar vê todos os pedidos), notificação com o app fechado e leitura de mensagens direto do WhatsApp.
