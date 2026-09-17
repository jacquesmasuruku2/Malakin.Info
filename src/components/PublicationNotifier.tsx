'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, BellRing, Sparkles, X } from 'lucide-react';
import {
  canShowNotificationPrompt,
  dismissNotificationPrompt,
  fetchLatestPublications,
  getLastSeenPublicationAt,
  getNotificationsEnabled,
  getShownPublicationIds,
  markPublicationShown,
  publicationHref,
  registerNotificationServiceWorker,
  requestBrowserNotificationPermission,
  setLastSeenPublicationAt,
  setNotificationsEnabled,
  showBrowserPublicationNotification,
  type PublicationNotice,
} from '@/lib/publication-notifications';

type Mode = 'prompt' | 'publication' | null;

export default function PublicationNotifier() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'fr';
  const isFrench = locale === 'fr';

  const [mode, setMode] = useState<Mode>(null);
  const [item, setItem] = useState<PublicationNotice | null>(null);
  const [extraCount, setExtraCount] = useState(0);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      await registerNotificationServiceWorker();

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          const url = event.data?.url;
          if (event.data?.type === 'NOTIFICATION_CLICK' && typeof url === 'string') {
            router.push(url);
          }
        });
      }

      const lastSeen = getLastSeenPublicationAt();
      const shownIds = new Set(getShownPublicationIds());
      const payload = await fetchLatestPublications(lastSeen);

      if (cancelled) return;

      const fresh = (payload.publications || []).filter((pub) => !shownIds.has(pub.id));
      const newest = fresh[0] || null;

      if (newest) {
        setItem(newest);
        setExtraCount(Math.max(0, fresh.length - 1));
        setMode('publication');
        markPublicationShown(newest.id);
        if (payload.latestPublishedAt) {
          setLastSeenPublicationAt(payload.latestPublishedAt);
        }
        if (getNotificationsEnabled()) {
          void showBrowserPublicationNotification(locale, newest);
        }
        return;
      }

      // First visit baseline: remember latest without spamming.
      if (!lastSeen && payload.latestPublishedAt) {
        setLastSeenPublicationAt(payload.latestPublishedAt);
      } else if (!lastSeen && payload.publications?.[0]?.publishedAt) {
        setLastSeenPublicationAt(payload.publications[0].publishedAt);
      }

      if (canShowNotificationPrompt()) {
        setMode('prompt');
      }
    };

    const timer = window.setTimeout(boot, 4500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [locale, router]);

  const close = () => setMode(null);

  const enableNotifications = async () => {
    setEnabling(true);
    try {
      await registerNotificationServiceWorker();
      const permission = await requestBrowserNotificationPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        dismissNotificationPrompt();
        const payload = await fetchLatestPublications(getLastSeenPublicationAt());
        const newest = payload.publications?.[0];
        if (newest) {
          setItem(newest);
          setExtraCount(Math.max(0, (payload.count || 1) - 1));
          setMode('publication');
          markPublicationShown(newest.id);
          if (payload.latestPublishedAt) setLastSeenPublicationAt(payload.latestPublishedAt);
          await showBrowserPublicationNotification(locale, newest);
        } else {
          setMode(null);
        }
      } else {
        dismissNotificationPrompt();
        setMode(null);
      }
    } finally {
      setEnabling(false);
    }
  };

  if (!mode) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-24 left-3 right-3 z-[72] mx-auto max-w-sm motion-safe:animate-[fadeInUp_0.45s_ease_both] sm:bottom-6 sm:left-auto sm:right-5"
    >
      <div className="overflow-hidden border border-white/20 bg-[#081c3d] text-white shadow-[0_22px_60px_rgba(8,28,61,0.45)]">
        <div className="relative overflow-hidden px-4 pb-4 pt-4">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#d4af37]/25 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            {mode === 'publication' && item?.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="mt-0.5 h-12 w-12 shrink-0 object-cover"
              />
            ) : (
              <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center bg-[#d4af37] text-[#081c3d]">
                {mode === 'prompt' ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d4af37]">
                MalakInfo
                {mode === 'publication' && item ? ` · ${item.label}` : ''}
              </p>
              {mode === 'prompt' ? (
                <>
                  <h2 className="mt-1 font-heading text-xl font-bold leading-tight">
                    {isFrench ? 'Ne manquez aucune publication' : 'Never miss a publication'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-blue-100/90">
                    {isFrench
                      ? 'Activez les notifications du navigateur pour être alerté dès qu’un nouvel article ou une offre paraît — aussi sur mobile.'
                      : 'Enable browser notifications to get alerts when a new article or job opening is published — including on mobile.'}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-1 font-heading text-xl font-bold leading-tight">
                    {isFrench ? 'Nouvelle publication' : 'New publication'}
                  </h2>
                  <p className="mt-2 text-[15px] font-semibold leading-snug text-white">
                    {item?.title}
                  </p>
                  {item?.excerpt ? (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-blue-100/85">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {extraCount > 0 ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#d4af37]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isFrench
                        ? `+${extraCount} autre${extraCount > 1 ? 's' : ''} nouveauté${extraCount > 1 ? 's' : ''}`
                        : `+${extraCount} more update${extraCount > 1 ? 's' : ''}`}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (mode === 'prompt') dismissNotificationPrompt();
                close();
              }}
              className="shrink-0 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label={isFrench ? 'Fermer' : 'Close'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            {mode === 'prompt' ? (
              <>
                <button
                  type="button"
                  disabled={enabling}
                  onClick={enableNotifications}
                  className="inline-flex items-center gap-2 bg-[#d4af37] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#081c3d] transition hover:bg-white disabled:opacity-60"
                >
                  <BellRing className="h-3.5 w-3.5" />
                  {enabling
                    ? isFrench
                      ? 'Activation…'
                      : 'Enabling…'
                    : isFrench
                      ? 'Activer'
                      : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissNotificationPrompt();
                    close();
                  }}
                  className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100/80 transition hover:text-white"
                >
                  {isFrench ? 'Plus tard' : 'Later'}
                </button>
              </>
            ) : item ? (
              <>
                <a
                  href={publicationHref(locale, item)}
                  onClick={close}
                  className="inline-flex items-center gap-2 bg-[#d4af37] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#081c3d] transition hover:bg-white"
                >
                  {item.kind === 'job'
                    ? isFrench
                      ? 'Voir l’offre'
                      : 'View opening'
                    : isFrench
                      ? 'Lire l’article'
                      : 'Read article'}
                </a>
                {!getNotificationsEnabled() && canShowNotificationPrompt() ? (
                  <button
                    type="button"
                    disabled={enabling}
                    onClick={enableNotifications}
                    className="inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {isFrench ? 'Alertes' : 'Alerts'}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
