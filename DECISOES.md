# Decisões do app mobile

## Navegação: React Navigation com Native Stack
É a biblioteca usada no material da disciplina. O app tem um fluxo de identificação: sem usuário salvo existe só a tela de identificação; com usuário, as telas mudam conforme o perfil (idoso ou familiar). As rotas são tipadas em `src/navigation/tipos.ts`, e a tela de detalhe recebe apenas o `id` da análise e busca o resto, para não trafegar objetos inteiros nem mostrar dados desatualizados.

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

## Acessibilidade para idosos
Fontes de 16 a 28, botões com pelo menos 60 de altura, contraste alto, uma ação principal por tela, rótulos de acessibilidade e mensagens de erro que dizem o que fazer. Cores e tamanhos ficam em `src/theme/` para manter o padrão em todo o app.

## Privacidade
O celular guarda apenas nome e perfil. O app nunca pede senha, CPF ou dados bancários.

## Fora do escopo por tempo
Vínculo real entre idoso e familiar (hoje o familiar vê todos os pedidos), notificação com o app fechado e leitura de mensagens direto do WhatsApp.
