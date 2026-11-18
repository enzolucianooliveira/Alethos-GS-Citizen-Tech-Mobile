// Ponto único de acesso aos dados. As telas importam `api` daqui e nunca
// sabem se estão falando com o mock ou com o backend real.

import { USAR_MOCK } from './config';
import { httpApi } from './httpApi';
import { mockApi } from './mockApi';
import type { ApiCliente } from './tipos';

export const api: ApiCliente = USAR_MOCK ? mockApi : httpApi;
export { USAR_MOCK };
