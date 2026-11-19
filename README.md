# Alethos: guardião antigolpe (app mobile)

## Ficha da CitizenTech

| Campo | Resposta |
| --- | --- |
| Nome da CitizenTech | Alethos: guardião antigolpe |
| Cidade e bairro | São Paulo, Jardim Íris |
| Cidadão beneficiado | Idosos que usam celular e suas famílias |
| Problema | Idosos recebem mensagens de golpe (falso parente, falsa central, link falso) e não têm a quem perguntar na hora de decidir se transferem dinheiro. |
| Como funciona | O idoso cola a mensagem suspeita e vê os sinais de golpe explicados em linguagem simples. Antes de transferir, pede confirmação à família pelo app ou por um botão físico (ESP32). O familiar recebe o aviso e responde "pode seguir" ou "não faça nada". |
| ODS | 10 (inclusão digital de idosos), 4 (letramento digital), 11 (comunidades seguras) |
| Repositório | https://github.com/enzolucianooliveira/GS-Fiap-Citizen-Tech-Mobile |

## Integrantes

| Nome | RM |
| --- | --- |
| Enzo Luciano Barros De Oliveira | 559557 |
| Alexandre Colvet Delfino | 560059 |
| Luigi Thiengo | 560755 |
| Pedro Scarceli | 561023 |
| Witalon Rodrigues | 559023 |

## O que o app faz

**Conta e acesso**
- Cadastro rápido com nome, telefone com DDD, PIN de 4 números e perfil.
- Login com telefone e PIN. O PIN é guardado só como hash SHA-256 com sal, nunca como texto.
- "Entrar rápido": as contas lembradas neste celular entram com um toque, o que facilita alternar entre o idoso e o familiar.
- Sessão lembrada ao reabrir o app (AsyncStorage) e bloqueio de 30 segundos depois de 5 PINs errados.

**Perfil idoso**
- Histórico das mensagens analisadas, com estados de carregando, erro e vazio.
- Formulário validado para analisar uma mensagem nova (texto e por onde chegou).
- Resultado com veredito (parece golpe, tenha cuidado, parece seguro) e cada sinal de alerta explicado.
- Botão "Chamar minha família", com o status da resposta. Enquanto a família não responde, o app confere sozinho a cada 5 segundos e avisa "Ainda sem resposta".
- Botão "Colar mensagem copiada" e leitura do resultado em voz alta.

**Para todos**
- Tutorial guiado na primeira visita de cada tela: o mascote Alethos aparece num balão que aponta para cada parte, explica para que serve e some sozinho em 7 segundos (ou com um toque). O botão "Dicas" mostra tudo de novo.
- Visual pensado para idosos: fonte Atkinson Hyperlegible (feita para baixa visão), títulos grandes, botões de 64 pontos de altura e uma cor por perfil (laranja para quem confere, roxo para a família).

**Perfil familiar**
- Lista de pedidos de confirmação, com "Pode seguir" e "Pare, é golpe".
- Notificação local quando chega um pedido novo, com a permissão tratada (concedida, ainda não perguntada e negada).
- Botão de demonstração que simula o botão físico do ESP32 (só no modo mock).

## Como rodar

Pré-requisitos: Node.js LTS e o app **Expo Go** atualizado no celular (o projeto usa o SDK 58).

```bash
npm install
npx expo start --lan
```

Leia o QR code com o Expo Go (Android) ou com a câmera (iOS). Celular e computador precisam estar na mesma rede Wi-Fi. Se a rede bloquear, use `npx expo start --tunnel`.

Verificação de tipos (precisa terminar sem nenhuma mensagem):

```bash
npx tsc --noEmit
```

### Mock ou API real

Em `src/services/config.ts`:

- `USAR_MOCK = true`: dados guardados no próprio celular, funciona sem backend.
- `USAR_MOCK = false`: usa a API de SOA em `URL_API`.
- `SIMULAR_FALHA = true`: força o estado de erro das listas (para demonstração).

## Estrutura

```txt
App.tsx                  providers e navegação
src/
  types/                 modelos do domínio e type guards
  theme/                 cores, fontes e espaçamentos
  components/            botão, campo, seletor, estados, cartões, layout, texto
  components/ilustracoes/ mascote Alethos e cenas desenhadas em SVG
  contexts/              usuário identificado (Context API)
  tutorial/              balões guiados: provider, alvos e os textos de cada tela
  hooks/                 carregamento genérico e permissão de notificação
  navigation/            stack e tipos das rotas
  screens/               as seis telas (entrar, cadastro, histórico, nova análise, resultado, pedidos)
  services/              api (mock ou HTTP), analisador de sinais, notificações, config
  storage/               sessão, contas lembradas e tutoriais vistos, no AsyncStorage
  validation/            validações puras dos formulários
  utils/                 erros, datas e textos
```

## Tecnologias

React Native, Expo SDK 58, TypeScript em modo estrito, React Navigation (Native Stack), AsyncStorage, expo-notifications, react-native-svg, expo-linear-gradient, expo-font (Atkinson Hyperlegible e Baloo 2), expo-speech, expo-clipboard e expo-crypto. Todos os módulos nativos usados já vêm no Expo Go.

## Contrato esperado da API

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/usuarios` | `{ nome, telefone, perfil, pin }` | `Usuario` (409 se o telefone já existir) |
| POST | `/sessoes` | `{ telefone, pin }` | `Usuario` (401 se o telefone ou o PIN estiverem errados) |
| GET | `/analises?usuarioId=` | | `Analise[]` |
| GET | `/analises/{id}` | | `Analise` |
| POST | `/analises` | `{ usuarioId, texto, origem }` | `Analise` (com veredito e sinais vindos do modelo de ML) |
| GET | `/pedidos` | | `Pedido[]` |
| GET | `/pedidos?analiseId=` | | `Pedido[]` |
| POST | `/pedidos` | `{ analiseId, idosoNome, descricao, origem }` | `Pedido` |
| PATCH | `/pedidos/{id}` | `{ status: "aprovado" \| "negado" }` | `Pedido` |

Os formatos de `Usuario`, `Analise` e `Pedido` estão em `src/types/index.ts`. A API nunca devolve o PIN nem o hash dele.
