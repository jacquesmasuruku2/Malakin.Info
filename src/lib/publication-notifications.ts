export type PublicationNotice = {
  id: string;
  kind: 'article' | 'job';
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | Date;
  label: string;
};

const ENABLED_KEY = 'malakinfo.notifications.enabled';
const LAST_SEEN_KEY = 'malakinfo.notifications.lastSeenAt';
const PROMPT_DISMISS_KEY = 'malakinfo.notifications.promptDismissedAt';
const SHOWN_IDS_KEY = 'malakinfo.notifications.shownIds';
const PROMPT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

export function getNotificationsEnabled() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ENABLED_KEY) === '1';
}

export function setNotificationsEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
}

export function getLastSeenPublicationAt() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_SEEN_KEY);
}

export function setLastSeenPublicationAt(value: string | Date) {
  if (typeof window === 'undefined') return;
  const iso = typeof value === 'string' ? value : value.toISOString();
  window.localStorage.setItem(LAST_SEEN_KEY, iso);
}

export function canShowNotificationPrompt() {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted' && getNotificationsEnabled()) return false;
  if (Notification.permission === 'denied') return false;

  const dismissed = Number(window.localStorage.getItem(PROMPT_DISMISS_KEY) || 0);
  return !dismissed || Date.now() - dismissed > PROMPT_COOLDOWN_MS;
}

export function dismissNotificationPrompt() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROMPT_DISMISS_KEY, String(Date.now()));
}

export function getShownPublicationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHOWN_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function markPublicationShown(id: string) {
  if (typeof window === 'undefined') return;
  const next = [id, ...getShownPublicationIds().filter((item) => item !== id)].slice(0, 40);
  window.localStorage.setItem(SHOWN_IDS_KEY, JSON.stringify(next));
}

export async function registerNotificationServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied' as NotificationPermission;
  }

  if (Notification.permission === 'granted') {
    setNotificationsEnabled(true);
    return 'granted' as NotificationPermission;
  }

  if (Notification.permission === 'denied') {
    return 'denied' as NotificationPermission;
  }

  const permission = await Notification.requestPermission();
  setNotificationsEnabled(permission === 'granted');
  return permission;
}

export function publicationHref(locale: string, item: PublicationNotice) {
  if (item.kind === 'job') return `/${locale}/emploi/${item.slug}`;
  return `/${locale}/${item.slug}`;
}

export async function showBrowserPublicationNotification(
  locale: string,
  item: PublicationNotice,
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted' || !getNotificationsEnabled()) return false;

  const url = publicationHref(locale, item);
  const title =
    item.kind === 'job'
      ? locale === 'fr'
        ? 'Nouvelle offre · MalakInfo'
        : 'New opening · MalakInfo'
      : locale === 'fr'
        ? 'Nouvelle publication · MalakInfo'
        : 'New story · MalakInfo';

  const payload = {
    type: 'SHOW_PUBLICATION',
    title,
    body: item.title,
    icon: item.imageUrl || '/images/logo.png',
    tag: `malakinfo-${item.kind}-${item.id}`,
    url,
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.active) {
      registration.active.postMessage(payload);
      return true;
    }
  } catch {
    // Fall through to Notification API.
  }

  try {
    const notification = new Notification(title, {
      body: item.title,
      icon: item.imageUrl || '/images/logo.png',
      tag: payload.tag,
      data: { url },
    });
    notification.onclick = () => {
      window.focus();
      window.location.href = url;
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}

export async function fetchLatestPublications(since?: string | null) {
  const params = new URLSearchParams();
  if (since) params.set('since', since);
  const response = await fetch(`/api/notifications/latest?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    return { publications: [] as PublicationNotice[], count: 0, latestPublishedAt: null as string | null };
  }
  return response.json() as Promise<{
    publications: PublicationNotice[];
    count: number;
    latestPublishedAt: string | null;
  }>;
}
