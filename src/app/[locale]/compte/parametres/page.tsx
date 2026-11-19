'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Bell, Shield, Globe, Save, LogOut, Moon, Sun } from 'lucide-react';
import { getLanguageOptions, getLocalizedPath } from '@/lib/i18n';
import { localeFromPathname, pickCopy, t, tAccount } from '@/lib/copy';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { applyTheme, logoutLocalSession, type SiteTheme } from '@/lib/theme';
import {
  dismissNotificationPrompt,
  setNotificationsEnabled,
} from '@/lib/publication-notifications';
import {
  disableSitePushNotifications,
  enableSitePushNotifications,
} from '@/lib/web-push-client';

function persistLocale(locale: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `app-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.localStorage.setItem('app-locale', locale);
  document.documentElement.lang = locale;
}

export default function SettingsPage() {
  const { user, ready } = useAccountUser();
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPathname(pathname);
  const languageOptions = getLanguageOptions();
  const [formData, setFormData] = useState({
    emailDigest: false,
    locale: 'fr',
    theme: 'light' as SiteTheme,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);
  const [pushChecking, setPushChecking] = useState(true);
  const [pushSaving, setPushSaving] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const response = await authFetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const theme = data.theme === 'dark' ? 'dark' : 'light';
          setFormData({
            emailDigest: data.emailDigest || false,
            locale: data.locale || 'fr',
            theme,
          });
          applyTheme(theme);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [ready, user]);

  useEffect(() => {
    if (!ready) return;
    if (!user?.id) return;

    let cancelled = false;
    const checkPushSubscription = async () => {
      if (
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        setPushSupported(false);
        setPushChecking(false);
        return;
      }

      setPushSupported(true);
      setPushPermission(Notification.permission);

      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        const subscription = registration
          ? await registration.pushManager.getSubscription()
          : null;
        if (cancelled) return;

        if (!subscription || Notification.permission !== 'granted') {
          setPushEnabled(false);
          return;
        }

        const response = await authFetch('/api/user/match-notifications/subscriptions', {
          headers: { 'x-push-endpoint': subscription.endpoint },
        });
        if (!response.ok) {
          throw new Error(
            pickCopy(locale, {
              fr: 'Impossible de vérifier l’état des notifications sur cet appareil.',
              en: 'Unable to check notification status on this device.',
              es: 'No se pudo comprobar el estado de las notificaciones en este dispositivo.',
              sw: 'Imeshindwa kuangalia hali ya arifa kwenye kifaa hiki.',
              ln: 'Ekoki te kotala ezalela ya ba notification na appareil oyo.',
              rw: 'Ntibishobotse kugenzura uko amatangazo ahagaze kuri iki gikoresho.',
            }),
          );
        }

        const result: unknown = await response.json();
        const registered =
          typeof result === 'object' &&
          result !== null &&
          'registered' in result &&
          result.registered === true;
        if (cancelled) return;

        setPushEnabled(registered);
      } catch (error) {
        console.error('Unable to check Push notification status:', error);
        if (!cancelled) {
          setPushError(
            error instanceof Error
              ? error.message
              : pickCopy(locale, {
                  fr: 'Impossible de vérifier l’état des notifications.',
                  en: 'Unable to check notification status.',
                  es: 'No se pudo comprobar el estado de las notificaciones.',
                  sw: 'Imeshindwa kuangalia hali ya arifa.',
                  ln: 'Ekoki te kotala ezalela ya ba notification.',
                  rw: 'Ntibishobotse kugenzura uko amatangazo ahagaze.',
                }),
          );
        }
      } finally {
        if (!cancelled) setPushChecking(false);
      }
    };

    void checkPushSubscription();
    return () => {
      cancelled = true;
    };
  }, [ready, user?.id, locale]);

  const handleLogout = async () => {
    logoutLocalSession();
    await signOut({ callbackUrl: '/' });
  };

  const handleThemeChange = (theme: SiteTheme) => {
    setFormData((current) => ({ ...current, theme }));
    applyTheme(theme);
    authFetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    }).catch(() => {
      // Theme still applies locally if the save fails.
    });
  };

  const handlePushToggle = async (enabled: boolean) => {
    setPushSaving(true);
    setPushError(null);
    try {
      if (enabled) {
        await enableSitePushNotifications(locale);
        setPushEnabled(true);
        setPushPermission('granted');
        setNotificationsEnabled(true);
      } else {
        await disableSitePushNotifications(locale);
        setPushEnabled(false);
        setNotificationsEnabled(false);
      }
      dismissNotificationPrompt();
    } catch (error) {
      console.error('Unable to update Push notification preference:', error);
      setPushError(
        error instanceof Error
          ? error.message
          : pickCopy(locale, {
              fr: 'Impossible de modifier les notifications Push.',
              en: 'Unable to update Push notifications.',
              es: 'No se pudieron actualizar las notificaciones Push.',
              sw: 'Imeshindwa kusasisha arifa za Push.',
              ln: 'Ekoki te kobongola ba notification Push.',
              rw: 'Ntibishobotse kuvugurura amatangazo ya Push.',
            }),
      );
      if ('Notification' in window) setPushPermission(Notification.permission);
    } finally {
      setPushSaving(false);
    }
  };

  const handleLocaleChange = (locale: string) => {
    setFormData((current) => ({ ...current, locale }));
    persistLocale(locale);
    authFetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    }).catch(() => {
      // Locale still switches locally if the save fails.
    });
    router.push(getLocalizedPath(pathname, locale));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await authFetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        applyTheme(formData.theme);
        persistLocale(formData.locale);
        const nextPath = getLocalizedPath(pathname, formData.locale);
        if (nextPath !== pathname) {
          router.push(nextPath);
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (!ready || (user && loading)) {
    return <div className="min-h-screen flex items-center justify-center">{t(locale, 'loading')}</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">{tAccount(locale, 'loginRequired')}</h1>
          <p className="mb-4 text-muted-foreground">{tAccount(locale, 'loginRequiredHint')}</p>
          <a href={`/${pathname.split('/')[1] || 'fr'}/compte/connexion`} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {tAccount(locale, 'signIn')}
          </a>
        </div>
      </div>
    );
  }

  const pushStatusMessage = pushChecking
    ? pickCopy(locale, {
        fr: 'Vérification de l’état des notifications…',
        en: 'Checking notification status…',
        es: 'Comprobando el estado de las notificaciones…',
        sw: 'Inaangalia hali ya arifa…',
        ln: 'Kotala ezalela ya ba notification…',
        rw: 'Turimo kugenzura uko amatangazo ahagaze…',
      })
    : !pushSupported
      ? pickCopy(locale, {
          fr: 'Ce navigateur ne prend pas en charge les notifications Push.',
          en: 'This browser does not support Push notifications.',
          es: 'Este navegador no admite notificaciones Push.',
          sw: 'Kivinjari hiki hakitumii arifa za Push.',
          ln: 'Navigateur oyo endimi te ba notification Push.',
          rw: 'Mucukumbuzi ntiyemera amatangazo ya Push.',
        })
      : pushPermission === 'denied'
        ? pickCopy(locale, {
            fr: 'Les notifications sont bloquées. Autorisez-les dans les paramètres du navigateur.',
            en: 'Notifications are blocked. Allow them in your browser settings.',
            es: 'Las notificaciones están bloqueadas. Permítelas en la configuración del navegador.',
            sw: 'Arifa zimezuiwa. Ziruhusu kwenye mipangilio ya kivinjari.',
            ln: 'Ba notification ekangami. Fungola yango na ba réglages ya navigateur.',
            rw: 'Amatangazo yarabujijwe. Yemerere mu igenamiterere rya mucukumbuzi.',
          })
        : pushEnabled
          ? pickCopy(locale, {
              fr: 'Les notifications Push sont actives sur cet appareil.',
              en: 'Push notifications are active on this device.',
              es: 'Las notificaciones Push están activas en este dispositivo.',
              sw: 'Arifa za Push zimewashwa kwenye kifaa hiki.',
              ln: 'Ba notification Push ezali kofungwama na appareil oyo.',
              rw: 'Amatangazo ya Push arakora kuri iki gikoresho.',
            })
          : pickCopy(locale, {
              fr: 'Votre navigateur demandera votre autorisation lors de l’activation.',
              en: 'Your browser will ask for permission when you enable them.',
              es: 'Tu navegador solicitará permiso cuando las actives.',
              sw: 'Kivinjari kitaomba ruhusa utakapowasha arifa.',
              ln: 'Navigateur ekosenga ndingisa ntango okofungola yango.',
              rw: 'Mucukumbuzi izagusaba uruhushya nuramuka uzifunguye.',
            });

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#081C3D] via-[#0B3B8B] to-[#2455a0] p-6 text-white shadow-xl shadow-primary/10 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-20 h-56 w-56 rounded-full border border-white/10"
          />
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                {user.name || 'MalakInfo'}
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {tAccount(locale, 'settings')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                {tAccount(locale, 'settingsSubtitle')}
              </p>
            </div>
            <Link
              href={`/${locale}/compte/profil`}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              {pickCopy(locale, {
                fr: 'Retour à mon profil',
                en: 'Back to my profile',
                es: 'Volver a mi perfil',
                sw: 'Rudi kwenye wasifu wangu',
                ln: 'Zonga na profil na ngai',
                rw: 'Subira ku mwirondoro wanjye',
              })}
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              {tAccount(locale, 'notifications')}
            </h2>
            <div className="space-y-5">
              <label className="flex cursor-pointer items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {tAccount(locale, 'pushNotifications')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tAccount(locale, 'pushNotificationsHint')}
                  </p>
                  <p
                    id="push-notification-status"
                    role="status"
                    className="mt-2 text-xs text-muted-foreground"
                  >
                    {pushStatusMessage}
                  </p>
                  {pushError ? (
                    <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                      {pushError}
                    </p>
                  ) : null}
                </div>
                <input
                  type="checkbox"
                  role="switch"
                  checked={pushEnabled}
                  disabled={
                    pushChecking ||
                    pushSaving ||
                    !pushSupported ||
                    (pushPermission === 'denied' && !pushEnabled)
                  }
                  onChange={(event) => void handlePushToggle(event.target.checked)}
                  aria-label={tAccount(locale, 'pushNotifications')}
                  aria-describedby="push-notification-status"
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              <div className="border-t border-border pt-5">
                <label className="flex cursor-pointer items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {tAccount(locale, 'dailyDigest')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tAccount(locale, 'dailyDigestHint')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.emailDigest}
                    onChange={(event) =>
                      setFormData({ ...formData, emailDigest: event.target.checked })
                    }
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              {tAccount(locale, 'language')}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {languageOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition hover:bg-muted/60"
                >
                  <input
                    type="radio"
                    name="language"
                    value={option.value}
                    checked={formData.locale === option.value}
                    onChange={() => handleLocaleChange(option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              {formData.theme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              {tAccount(locale, 'theme')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  formData.theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/60'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-foreground">{tAccount(locale, 'light')}</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  formData.theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/60'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-foreground">{tAccount(locale, 'dark')}</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              {tAccount(locale, 'security')}
            </h2>
            <div className="space-y-4">
              <button className="font-medium text-primary hover:text-primary/80">
                {tAccount(locale, 'changePassword')}
              </button>
              <button className="font-medium text-primary hover:text-primary/80">
                {tAccount(locale, 'enable2fa')}
              </button>
              <button className="font-medium text-red-600 hover:text-red-700">
                {tAccount(locale, 'deleteAccount')}
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? tAccount(locale, 'saving') : tAccount(locale, 'saveChanges')}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-600/30 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              {tAccount(locale, 'logout')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
