# Antigolpe: app mobile

## Ficha da CitizenTech

| Campo | Resposta |
| --- | --- |
| Nome da CitizenTech | Antigolpe *(ajustem o nome da equipe)* |
| Cidade e bairro | São Paulo, *(bairro da pessoa entrevistada)* |
| Cidadão beneficiado | Idosos que usam celular e suas famílias |
| Problema | Idosos recebem mensagens de golpe (falso parente, falsa central, link falso) e não têm a quem perguntar na hora de decidir se transferem dinheiro. |
| Como funciona | O idoso cola a mensagem suspeita e vê os sinais de golpe explicados em linguagem simples. Antes de transferir, pede confirmação à família pelo app ou por um botão físico (ESP32). O familiar recebe o aviso e responde "pode seguir" ou "não faça nada". |
| Indicador de impacto | *(ex.: % de mensagens de golpe identificadas nos testes; pedidos negados que evitaram transferência)* |
| ODS | 10 (inclusão digital de idosos), 4 (letramento digital), 11 (comunidades seguras) |
| Repositório | *(link)* |

## Integrantes

| Nome | RM |
| --- | --- |
| Enzo Luciano Barros De Oliveira | 559557 |
| *(integrante 2)* | *(RM)* |
| *(integrante 3)* | *(RM)* |
| *(integrante 4)* | *(RM)* |
| *(integrante 5)* | *(RM)* |

## O que o app faz

**Perfil idoso**
- Identificação com nome e perfil, lembrada ao reabrir o app (AsyncStorage).
- Histórico das mensagens analisadas, com estados de carregando, erro e vazio.
- Formulário validado para analisar uma mensagem nova (texto e por onde chegou).
- Resultado com veredito (parece golpe, tenha cuidado, parece seguro) e cada sinal de alerta explicado.
- Botão "Pedir para minha família confirmar", com o status da resposta.

**Perfil familiar**
- Lista de pedidos de confirmação, com "Pode seguir" e "Não faça nada, é golpe".
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
  components/            botão, campo, seletor, estados, cartões, layout
  contexts/              usuário identificado (Context API)
  hooks/                 carregamento genérico e permissão de notificação
  navigation/            stack e tipos das rotas
  screens/               as cinco telas
  services/              api (mock ou HTTP), analisador de sinais, notificações, config
  storage/               leitura e gravação do usuário no AsyncStorage
  validation/            validações puras dos formulários
  utils/                 erros, datas e textos
```

## Tecnologias

React Native 0.88, Expo SDK 58, TypeScript em modo estrito, React Navigation (Native Stack), AsyncStorage e expo-notifications.

## Contrato esperado da API

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/analises?usuarioId=` | | `Analise[]` |
| GET | `/analises/{id}` | | `Analise` |
| POST | `/analises` | `{ usuarioId, texto, origem }` | `Analise` (com veredito e sinais vindos do modelo de ML) |
| GET | `/pedidos` | | `Pedido[]` |
| GET | `/pedidos?analiseId=` | | `Pedido[]` |
| POST | `/pedidos` | `{ analiseId, idosoNome, descricao, origem }` | `Pedido` |
| PATCH | `/pedidos/{id}` | `{ status: "aprovado" \| "negado" }` | `Pedido` |

Os formatos de `Analise` e `Pedido` estão em `src/types/index.ts`.
