// Configuração da camada de services. Tudo que muda entre "protótipo" e
// "API real da equipe" fica aqui, e nenhuma tela precisa saber disso.

/**
 * true: usa dados falsos guardados no próprio celular (funciona sem a API).
 * false: chama a API de SOA no endereço abaixo.
 */
export const USAR_MOCK = true;

/**
 * Endereço da API. No celular, "localhost" é o próprio celular: use o IP do
 * computador na rede (o mesmo do exp://192.168... do Metro) ou o endereço do
 * Windows Server da equipe.
 */
export const URL_API = 'http://192.168.15.3:5000/api';

/** Quanto tempo esperar a API antes de desistir. */
export const TEMPO_LIMITE_MS = 10_000;

/** Atraso artificial do mock, para dar para ver o estado "carregando". */
export const ATRASO_MOCK_MS = 700;

/**
 * Para gravar o vídeo: true faz as listas do mock falharem,
 * mostrando o estado de erro e o botão "Tentar de novo".
 */
export const SIMULAR_FALHA = false;

/** De quanto em quanto tempo a tela do familiar procura pedidos novos. */
export const INTERVALO_CONSULTA_MS = 5_000;
