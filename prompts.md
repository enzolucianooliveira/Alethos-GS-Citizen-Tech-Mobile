# Registro de uso de IA: Alethos (app mobile)

Este arquivo registra como a equipe usou IA generativa no desenvolvimento do app mobile do **Alethos: guardião antigolpe**, conforme pede a Global Solution 2026.2.

## Como usamos a IA

- **Ferramenta:** assistente de IA (Claude), usado como par de programação e revisor.
- **Regra da equipe:** a IA propõe, a equipe decide. Todo código gerado foi lido, testado no Expo Go e só entrou no repositório depois de passar no `npx tsc --noEmit`.
- **Contexto sempre junto:** em cada pedido mandamos a rubrica da disciplina, o trecho de código envolvido e a mensagem de erro completa, quando havia.
- **O que não delegamos:** a escolha do problema, as entrevistas, as decisões de produto e a validação final de cada entrega.

## Resumo

| # | Fase | Assunto | Resultado principal |
| --- | --- | --- | --- |
| 01 | Ideação | Problema que atravessa todas as disciplinas | Escolha do antigolpe para idosos |
| 02 | Pesquisa | Dados sobre golpes e roteiro de entrevista | Números para o pitch e o TOGAF |
| 03 | Arquitetura | Como app, API, ML, ESP32 e IIS conversam | Contrato da API e fluxo do pedido |
| 04 | Planejamento | Roteiro de estudo pela rubrica de Mobile | Plano de 6 dias |
| 05 | TypeScript | Modelos, union types e type guards | Zero `any`, respostas validadas |
| 06 | Arquitetura | Camada de services com mock | Troca mock/API com uma constante |
| 07 | Funcionalidade | Estados de carregando, erro e vazio | Hook genérico `useCarregamento` |
| 08 | Funcionalidade | Validação pura dos formulários | Regras reutilizáveis sem React |
| 09 | Domínio | Analisador explicável de sinais de golpe | Regras em array, com pesos |
| 10 | Recurso nativo | Notificação com permissão tratada | Três estados de permissão |
| 11 | Funcionalidade | Identificação lembrada e fluxo por perfil | Context API e AsyncStorage |
| 12 | Design | Identidade visual para idosos | Fonte para baixa visão e cores por perfil |
| 13 | UX | Tutorial guiado estilo jogo | Balões que apontam e somem |
| 14 | UX | Retorno enquanto a família não responde | Verificação automática |
| 15 | Marca | Mascote com tema grego | Alethos, o hoplita guardião |
| 16 | Depuração | Erros "Cannot find module" | Dependências reinstaladas |
| 17 | Qualidade | Revisão final contra a rubrica | Checklist de entrega |
| 18 | Segurança | Login, cadastro e contas lembradas | PIN com hash e entrar com um toque |

---

## 01. Ideação do problema

**Objetivo:** encontrar um problema real que coubesse nas oito disciplinas ao mesmo tempo.

**Prompt:**
> Temos o briefing da GS CitizenTech em anexo. A solução precisa ter app mobile para o cidadão, desktop C# para um operador, API com banco, modelo de ML, circuito ESP32, aplicação web no IIS, relatório de riscos e diagrama TOGAF. Nos interessamos por segurança da comunidade, educação e independência no uso de IA. Proponha ideias em que o sensor faça sentido de verdade, exista um lado "cidadão" e um lado "operador", e seja fácil entrevistar alguém que vive o problema. Compare as ideias por encaixe nas disciplinas, facilidade de entrevista e força no pitch.

**Resultado:** mais de 20 ideias comparadas. A equipe escolheu o antigolpe para idosos, que une segurança e letramento sobre os riscos da IA (voz clonada, falso parente).

**Validação da equipe:** discutimos as três finalistas em reunião e votamos. O botão físico "confirmar com a família" (ESP32) foi o que decidiu, porque dá ao circuito uma função real.

## 02. Pesquisa do problema e roteiro de entrevista

**Objetivo:** ter dados confiáveis para o pitch e preparar a conversa com o público-alvo.

**Prompt:**
> Pesquise dados recentes sobre estelionato digital no Brasil e sobre idosos conectados, sempre com a fonte. Liste os golpes mais comuns contra idosos e os sinais de alerta que quase todos têm em comum. Depois, monte um roteiro curto de entrevista para um idoso e para um familiar, com cuidados éticos (consentimento e anonimização).

**Resultado:** tabela de dados com fontes, sete tipos de golpe, oito sinais de alerta e dois roteiros de entrevista.

**Validação da equipe:** conferimos os números nas fontes originais antes de usar. Os oito sinais de alerta viraram as regras do analisador (prompt 09) e as explicações que o app mostra.

## 03. Arquitetura e contrato da API

**Objetivo:** definir como as partes se comunicam antes de cada integrante começar a programar.

**Prompt:**
> Desenhe a arquitetura do antigolpe: app Expo, API em .NET no IIS, classificador em Python, ESP32 no Wokwi e painel C#. Considere que o Wokwi não alcança um servidor local. Explique o caminho completo de um pedido de confirmação, do botão físico até a resposta da família, e proponha as rotas REST com o formato do JSON de cada uma.

**Resultado:** diagrama com a API no centro, broker MQTT como ponte do ESP32 e tabela de rotas (`/analises`, `/pedidos`).

**Validação da equipe:** o contrato foi revisado com o integrante de SOA e está no README. Com ele, o app pôde avançar com dados simulados enquanto a API era construída.

## 04. Roteiro de estudo pela rubrica

**Objetivo:** saber exatamente o que estudar para cumprir a rubrica de Mobile no prazo.

**Prompt:**
> Esta é a rubrica de Mobile (funcionalidade 40%, TypeScript 30%, recurso nativo 20%, organização 10%) e as portas de entrada. Monte um roteiro de estudo em ordem, só com o que a rubrica cobra, com o porquê de cada etapa, o sinal de "pronto" e as armadilhas comuns. O curso usa React Navigation, não Expo Router.

**Resultado:** roteiro em oito etapas, glossário de termos e plano dia a dia até a entrega.

**Validação da equipe:** comparamos com o repositório da disciplina e trocamos o Expo Router pelo React Navigation, que é o que o professor ensina.

## 05. Modelagem de tipos sem `any`

**Objetivo:** cumprir "modo estrito, sem any, tipos nos modelos, rotas e respostas".

**Prompt:**
> Modele os tipos do domínio em TypeScript estrito: usuário com perfil, análise de mensagem com veredito e sinais, pedido de confirmação com status. As opções fixas (perfis, origens, vereditos) devem ser declaradas uma vez em arrays `as const`, com o tipo derivado delas. Como tratar o JSON da API e do AsyncStorage sem usar `any`?

**Resultado:** `src/types/index.ts` com tipos derivados de arrays e `src/types/guards.ts` com type guards que validam valores `unknown`.

**Validação da equipe:** forçamos um JSON errado no mock para ver o guard barrar a resposta. Rodamos `tsc --noEmit` e buscamos `: any` e `as any` no projeto: nenhum resultado.

## 06. Camada de services com mock

**Objetivo:** não depender da API para construir as telas.

**Prompt:**
> Crie uma interface `ApiCliente` com as operações do app e duas implementações: um mock que guarda os dados no AsyncStorage, com atraso e falha simulados, e uma versão HTTP com `fetch`, tempo limite e tratamento de erro. As telas devem importar um único `api` e nunca saber qual das duas está em uso.

**Resultado:** `src/services/` com `mockApi.ts`, `httpApi.ts`, `api.ts` e `config.ts` (`USAR_MOCK`, `SIMULAR_FALHA`).

**Validação da equipe:** ligamos e desligamos `SIMULAR_FALHA` para ver o estado de erro em todas as listas. Confirmamos que nenhuma tela importa `fetch` diretamente.

## 07. Estados de carregando, erro e vazio

**Objetivo:** cumprir "lista com carregando, erro e vazio" sem repetir código em cada tela.

**Prompt:**
> Escreva um hook genérico que receba a função de busca e devolva o estado da tela como um union discriminado (carregando, erro ou sucesso), recarregando quando a tela volta ao foco. Também quero um jeito de atualizar os dados sem piscar o carregando.

**Resultado:** `useCarregamento<T>` e o tipo `EstadoTela<T>`, usados nas três telas que buscam dados.

**Validação da equipe:** testamos os três estados no celular. Notamos que o item novo não aparecia ao voltar do formulário e pedimos o recarregamento no foco.

## 08. Validação pura

**Objetivo:** cumprir "validação pura" e mostrar erros claros para o idoso.

**Prompt:**
> Escreva as validações dos formulários de identificação e de nova análise como funções puras, sem nada de React, que recebem os dados e devolvem um erro por campo. Quero regras pequenas e reutilizáveis (obrigatório, mínimo, máximo), com mensagens que dizem o que fazer, e não só o que está errado.

**Resultado:** `src/validation/index.ts` com regras compostas e o tipo `ErrosDe<T>`.

**Validação da equipe:** testamos as funções isoladamente com entradas vazias, curtas e válidas. Acrescentamos o `trim()` depois de ver que um campo só com espaços passava como preenchido.

## 09. Analisador explicável de sinais de golpe

**Objetivo:** dar ao idoso o "porquê" do resultado, para que ele aprenda a reconhecer o golpe sozinho.

**Prompt:**
> Crie um analisador por regras para mensagens em português: cada regra tem id, título, explicação simples, peso e padrões de texto. Normalize acentos e maiúsculas. O veredito (golpe, suspeito, seguro) sai da soma dos pesos. Rode estes casos de teste e mostre o resultado de cada um: falso parente pedindo Pix, falsa central com link, prêmio, "vou chegar hoje às 19h" e "reunião da escola amanhã".

**Resultado:** `src/services/analisador.ts` com nove regras em array e limites configuráveis.

**Validação da equipe:** "vou chegar hoje" aparecia como suspeito por causa da palavra "hoje". Baixamos o peso de "Cria pressa" para 1. "5 mil reais" não era reconhecido como valor, e ajustamos o padrão.

## 10. Notificação com permissão tratada

**Objetivo:** cumprir o recurso nativo de 20% funcionando no Expo Go.

**Prompt:**
> O familiar precisa ser avisado quando chega um pedido. Considerando que push remoto não funciona no Expo Go para Android desde o SDK 53, proponha uma solução com notificação local. Trate a permissão nos três casos (concedida, ainda pode pedir e negada de vez), explique o motivo antes de pedir e mantenha o app funcionando sem a permissão.

**Resultado:** `src/services/notificacoes.ts`, o hook `usePermissaoNotificacao` (que confere de novo ao voltar das configurações) e consulta periódica na tela da família.

**Validação da equipe:** testamos aceitar, negar e reativar nas configurações do Android. Registramos no DECISOES.md a limitação de só avisar com o app aberto.

## 11. Identificação lembrada e fluxo por perfil

**Objetivo:** cumprir "identificação lembrada ao reabrir" e separar as telas do idoso e da família.

**Prompt:**
> Implemente a identificação com nome e perfil (idoso ou familiar) salva no AsyncStorage, exposta por Context API. Na navegação, sem usuário só existe a identificação; com usuário, as telas mudam conforme o perfil. Evite que a tela de identificação "pisque" enquanto o app lê os dados salvos.

**Resultado:** `UsuarioContext`, `usuarioStorage` e o `AppNavigator` com fluxo por perfil.

**Validação da equipe:** fechamos o app pela lista de recentes e reabrimos nos dois perfis. O botão "Sair" foi pedido pela equipe para facilitar a demonstração no vídeo.

## 12. Identidade visual para idosos

**Objetivo:** sair do visual genérico e pensar de verdade no público-alvo.

**Prompt:**
> Redesenhe o app para idosos: fonte criada para baixa visão, títulos grandes, botões com área de toque generosa, contraste alto e uma cor por perfil. Quero ilustrações originais em SVG (sem imagens de terceiros), emojis nos sinais e nas opções, e um fundo colorido em degradê. Centralize cores e tamanhos no tema.

**Resultado:** fonte Atkinson Hyperlegible (Braille Institute), títulos em Baloo 2, laranja para quem confere e roxo para a família, ilustrações em SVG e o componente `Texto`.

**Validação da equipe:** mostramos as telas para a pessoa entrevistada e pedimos um fundo mais colorido. A cor por perfil ajudou a entender "onde estou" sem ler.

## 13. Tutorial guiado estilo jogo

**Objetivo:** explicar cada parte da tela para quem tem pouca familiaridade com apps.

**Prompt:**
> Quero um tutorial como em jogos: a tela escurece, um recorte destaca a parte explicada e um balão com o mascote aponta para ela. Cada dica some sozinha depois de alguns segundos, com barra de tempo, ou com um toque. Os textos devem ficar em arrays separados das telas. Mostrar só na primeira visita e ter um botão "Dicas" para rever.

**Resultado:** `src/tutorial/` com provider, `AlvoTutorial`, `measureInWindow`, recorte em SVG, avanço automático em 7 segundos e opção de ouvir a dica.

**Validação da equipe:** ajustamos o tempo de cada dica para dar tempo de leitura. Passos opcionais passaram a ser pulados quando a parte não está na tela.

## 14. Retorno enquanto a família não responde

**Objetivo:** corrigir um problema encontrado nos testes: ao tocar em "Ver resposta" sem a família ter respondido, nada acontecia na tela.

**Prompt:**
> Na tela de resultado, quando o pedido à família está pendente, tocar em "Ver resposta" não dá nenhum retorno. Quero que o app confira sozinho de tempos em tempos, mostre o horário do envio e da última verificação, deixe claro que ainda não há resposta e sugira ligar para a família se demorar.

**Resultado:** verificação automática a cada 5 segundos enquanto o pedido está pendente, com o aviso "Ainda sem resposta da sua família" e o horário da última verificação.

**Validação da equipe:** testamos com dois perfis no mesmo celular. A resposta da família aparece sozinha, sem precisar tocar em nada.

## 15. Mascote com tema grego

**Objetivo:** ligar a identidade visual ao nome Alethos ("verdadeiro", em grego).

**Prompt:**
> O nome do projeto é Alethos, do grego. Redesenhe o mascote como um guardião grego, com o mesmo nome do app, em SVG original: escudo hoplita redondo de bronze, elmo com penacho, borda com o padrão de grega e ramos de louro. Ele precisa continuar legível em 64 pixels e ser usado também no ícone do app.

**Resultado:** novo `Gui.tsx` com os elementos em arrays (folhas, listras do penacho, peças da grega) e ícone, abertura e favicon gerados a partir dele.

**Validação da equipe:** conferimos o mascote em tamanho grande e pequeno antes de aprovar.

## 16. Depuração: "Cannot find module"

**Objetivo:** resolver dez erros de TypeScript depois de atualizar o projeto.

**Prompt:**
> Depois de atualizar os arquivos, o `npx tsc --noEmit` mostrou 10 erros em 7 arquivos, todos em imports como `react-native-svg`. O que está acontecendo e como resolver sem quebrar o resto?

**Resultado:** as bibliotecas novas estavam no `package.json`, mas não tinham sido instaladas. Rodar `npm install` resolveu.

**Validação da equipe:** `tsc --noEmit` voltou a passar sem nenhuma mensagem.

## 17. Revisão final contra a rubrica

**Objetivo:** garantir que nada da rubrica nem das portas de entrada ficou para trás.

**Prompt:**
> Revise o projeto item por item contra a rubrica de Mobile e as portas de entrada. Para cada critério, diga se está atendido e em qual arquivo. Rode `tsc --noEmit`, procure `any` e confira se o README tem a Ficha da CitizenTech, se o DECISOES.md existe e se o `package.json` tem o array `authors` com nome e RM de todos.

**Resultado:** checklist com a situação de cada critério e a lista de pendências: indicador de impacto, RMs em formatos diferentes e textos de botão desatualizados no README.

**Validação da equipe:** corrigimos as pendências, testamos o app no celular nos dois perfis e geramos o ZIP sem `node_modules` com `git archive`.

## 18. Login, cadastro e contas lembradas

**Objetivo:** dar a cada pessoa sua própria conta e facilitar a troca entre o idoso e o familiar no mesmo celular.

**Prompt:**
> Crie um cadastro e login rápidos para idosos: telefone com DDD como login e um PIN de 4 números. O PIN não pode ficar guardado como texto. Quero "Entrar rápido" com as contas lembradas no celular, para trocar entre o idoso e o familiar com um toque, sem guardar o PIN. Valide os formulários com funções puras, bloqueie PINs fáceis e limite as tentativas erradas. A mesma interface `ApiCliente` precisa ganhar as rotas de cadastro e de login no mock e na versão HTTP.

**Resultado:** telas Entrar e Cadastro, `validarCadastro` e `validarEntrada`, hash SHA-256 com sal (`expo-crypto`), contas lembradas no AsyncStorage, bloqueio de 30 segundos após 5 erros e as rotas `POST /usuarios` e `POST /sessoes` no contrato.

**Validação da equipe:** testamos cadastro com dados errados, PIN fraco, PINs diferentes, login com PIN errado até o bloqueio e a troca entre duas contas com um toque. Conferimos no banco simulado que o PIN aparece só como hash.

---

## O que aprendemos usando IA

- **Contexto bom gera resposta boa.** Mandar a rubrica, o código e o erro completo economizou idas e vindas.
- **Teste sempre.** Os ajustes mais importantes (peso do sinal de pressa, item novo na lista, retorno sem resposta da família) só apareceram testando no celular.
- **A decisão continua sendo da equipe.** A IA sugeriu Expo Router, e ficamos com o React Navigation do curso; a IA sugeriu nomes, e a equipe escolheu Alethos.
