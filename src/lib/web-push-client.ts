import { authFetch } from '@/lib/client-auth';
import { pickCopy } from '@/lib/copy';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ??
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type PushMessages = {
  unsupported: string;
  secureContext: string;
  missingPublicKey: string;
  permissionDenied: string;
  permissionRequired: string;
  saveFailed: string;
  removeFailed: string;
};

function getPushMessages(locale: string): PushMessages {
  return {
    unsupported: pickCopy(locale, {
      fr: 'Ce navigateur ne prend pas en charge les notifications Push.',
      en: 'This browser does not support Push notifications.',
      es: 'Este navegador no admite notificaciones Push.',
      sw: 'Kivinjari hiki hakitumii arifa za Push.',
      ln: 'Navigateur oyo endimi te ba notification Push.',
      rw: 'Mucukumbuzi ntiyemera amatangazo ya Push.',
    }),
    secureContext: pickCopy(locale, {
      fr: 'Les notifications Push nécessitent une connexion HTTPS sécurisée.',
      en: 'Push notifications require a secure HTTPS connection.',
      es: 'Las notificaciones Push requieren una conexión HTTPS segura.',
      sw: 'Arifa za Push zinahitaji muunganisho salama wa HTTPS.',
      ln: 'Ba notification Push esengaka connexion HTTPS ya bokengi.',
      rw: 'Amatangazo ya Push asaba HTTPS itekanye.',
    }),
    missingPublicKey: pickCopy(locale, {
      fr: 'La clé publique des notifications Push n’est pas configurée.',
      en: 'The Push notification public key is not configured.',
      es: 'La clave pública de notificaciones Push no está configurada.',
      sw: 'Ufunguo wa umma wa arifa za Push haujawekwa.',
      ln: 'Clé publique ya ba notification Push ebongisami te.',
      rw: 'Urufunguzo rusange rwa Push ntirwateguwe.',
    }),
    permissionDenied: pickCopy(locale, {
      fr: 'Les notifications sont bloquées. Autorisez-les dans les paramètres du navigateur.',
      en: 'Notifications are blocked. Allow them in your browser settings.',
      es: 'Las notificaciones están bloqueadas. Permítelas en la configuración del navegador.',
      sw: 'Arifa zimezuiwa. Ziruhusu kwenye mipangilio ya kivinjari.',
      ln: 'Ba notification ekangami. Fungola yango na ba réglages ya navigateur.',
      rw: 'Amatangazo yarabujijwe. Yemerere mu igenamiterere rya mucukumbuzi.',
    }),
    permissionRequired: pickCopy(locale, {
      fr: 'Autorisez les notifications du navigateur pour les recevoir.',
      en: 'Allow browser notifications to receive them.',
      es: 'Permite las notificaciones del navegador para recibirlas.',
      sw: 'Ruhusu arifa za kivinjari ili uzipokee.',
      ln: 'Pesa navigateur ndingisa mpo na kozwa ba notification.',
      rw: 'Emera amatangazo ya mucukumbuzi kugira ngo uyakire.',
    }),
    saveFailed: pickCopy(locale, {
      fr: 'Impossible d’enregistrer cet appareil pour les notifications.',
      en: 'Unable to register this device for notifications.',
      es: 'No se pudo registrar este dispositivo para recibir notificaciones.',
      sw: 'Imeshindwa kusajili kifaa hiki kwa ajili ya arifa.',
      ln: 'Ekoki te kokomisa appareil oyo mpo na ba notification.',
      rw: 'Ntibishobotse kwandikisha iki gikoresho ku matangazo.',
    }),
    removeFailed: pickCopy(locale, {
      fr: 'Impossible de désactiver les notifications sur cet appareil.',
      en: 'Unable to disable notifications on this device.',
      es: 'No se pudieron desactivar las notificaciones en este dispositivo.',
      sw: 'Imeshindwa kuzima arifa kwenye kifaa hiki.',
      ln: 'Ekoki te kopekisa ba notification na appareil oyo.',
      rw: 'Ntibishobotse guhagarika amatangazo kuri iki gikoresho.',
    }),
  };
}

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

function getResponseError(body: unknown, fallback: string): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }
  return fallback;
}

async function getOrCreateSubscription(locale: string): Promise<PushSubscription> {
  const messages = getPushMessages(locale);
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error(messages.unsupported);
  }
  if (!window.isSecureContext) {
    throw new Error(messages.secureContext);
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error(messages.missingPublicKey);
  }

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission === 'denied') {
    throw new Error(messages.permissionDenied);
  }
  if (permission !== 'granted') {
    throw new Error(messages.permissionRequired);
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

  return subscription;
}

async function saveSubscription(subscription: PushSubscription, locale: string) {
  const messages = getPushMessages(locale);
  const response = await authFetch('/api/user/match-notifications/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getResponseError(body, messages.saveFailed));
  }
}

async function enablePushNotifications(locale: string) {
  const subscription = await getOrCreateSubscription(locale);
  await saveSubscription(subscription, locale);
}

export async function enableFootballMatchNotifications(english = false): Promise<void> {
  await enablePushNotifications(english ? 'en' : 'fr');
}

export async function enableSitePushNotifications(locale: string): Promise<void> {
  await enablePushNotifications(locale);
}

export async function disableSitePushNotifications(locale: string): Promise<void> {
  const messages = getPushMessages(locale);
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error(messages.unsupported);
  }

  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null;
  if (!subscription) return;

  const response = await authFetch('/api/user/match-notifications/subscriptions', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getResponseError(body, messages.removeFailed));
  }

  await subscription.unsubscribe();
}
