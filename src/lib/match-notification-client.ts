import { authFetch } from '@/lib/client-auth';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;

function decodeVapidPublicKey(value: string): ArrayBuffer {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

export async function enableFootballMatchNotifications(): Promise<void> {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Ce navigateur ne prend pas en charge les notifications Push.');
  }
  if (!window.isSecureContext) {
    throw new Error('Les notifications Push nécessitent une connexion HTTPS.');
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('La clé publique VAPID du site n’est pas configurée.');
  }

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== 'granted') {
    throw new Error('Autorisez les notifications du navigateur pour recevoir les rappels de matches.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  const readyRegistration = await navigator.serviceWorker.ready;
  const activeRegistration = readyRegistration.active ? readyRegistration : registration;
  const subscription =
    (await activeRegistration.pushManager.getSubscription()) ??
    (await activeRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidPublicKey(VAPID_PUBLIC_KEY),
    }));

  const response = await authFetch('/api/user/match-notifications/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error
        : 'Impossible d’enregistrer cet appareil pour les notifications.';
    throw new Error(message);
  }
}
