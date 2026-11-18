// Recurso nativo: notificação LOCAL (disparada pelo próprio app).
// Push remoto não funciona no Expo Go para Android desde o SDK 53, por isso o
// familiar recebe o aviso por consulta periódica + notificação local.

import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import type { Pedido } from '../types';

/** Os estados de permissão que o app trata, em português. */
export type SituacaoPermissao =
  | 'verificando'
  | 'concedida'
  | 'pode_pedir' // ainda não perguntamos, ou o sistema permite perguntar de novo
  | 'negada' // negada de vez: só nas configurações do celular
  | 'indisponivel'; // navegador (web) não tem esse recurso

const CANAL_ANDROID = 'pedidos-confirmacao';

export const notificacoesDisponiveis = Platform.OS !== 'web';

/** Chamado uma vez ao abrir o app: define como a notificação aparece com o app aberto. */
export function configurarNotificacoes(): void {
  if (!notificacoesDisponiveis) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function traduzir(status: Notifications.NotificationPermissionsStatus): SituacaoPermissao {
  if (status.granted) return 'concedida';
  return status.canAskAgain ? 'pode_pedir' : 'negada';
}

export async function consultarPermissao(): Promise<SituacaoPermissao> {
  if (!notificacoesDisponiveis) return 'indisponivel';
  return traduzir(await Notifications.getPermissionsAsync());
}

export async function pedirPermissao(): Promise<SituacaoPermissao> {
  if (!notificacoesDisponiveis) return 'indisponivel';
  // No Android 13+, o canal precisa existir antes de pedir a permissão.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Pedidos de confirmação',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return traduzir(await Notifications.requestPermissionsAsync());
}

/** Abre a tela de configurações do app no celular (para quem negou de vez). */
export function abrirConfiguracoes(): Promise<void> {
  return Linking.openSettings();
}

export async function notificarPedido(pedido: Pedido): Promise<void> {
  if (!notificacoesDisponiveis) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${pedido.idosoNome} pediu sua confirmação`,
      body: pedido.descricao,
      data: { pedidoId: pedido.id },
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_ANDROID } : null, // agora
  });
}
