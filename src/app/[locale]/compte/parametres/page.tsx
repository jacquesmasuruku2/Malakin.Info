'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, Shield, Globe, Save, LogOut, Moon, Sun } from 'lucide-react';
import { getLanguageOptions, getLocalizedPath } from '@/lib/i18n';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { applyTheme, logoutLocalSession, type SiteTheme } from '@/lib/theme';

export default function SettingsPage() {
  const { user, ready } = useAccountUser();
  const pathname = usePathname();
  const router = useRouter();
  const languageOptions = getLanguageOptions();
  const [formData, setFormData] = useState({
    emailNewsletter: false,
    emailDigest: false,
    locale: 'fr',
    theme: 'light' as SiteTheme,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const response = await authFetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const theme = data.theme === 'dark' ? 'dark' : 'light';
          setFormData({
            emailNewsletter: data.emailNewsletter || false,
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
  }, [ready, user?.id]);

  const handleLogout = async () => {
    logoutLocalSession();
    await signOut({ callbackUrl: '/' });
  };

  const persistLocale = (locale: string) => {
    document.cookie = `app-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem('app-locale', locale);
    document.documentElement.lang = locale;
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

  if (!ready || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Connexion requise</h1>
          <p className="mb-4 text-muted-foreground">Connectez-vous pour gérer la langue et le thème du site.</p>
          <a href={`/${pathname.split('/')[1] || 'fr'}/compte/connexion`} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences de compte</p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Newsletter par email</p>
                  <p className="text-sm text-muted-foreground">Recevoir les actualités par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNewsletter}
                  onChange={(e) => setFormData({ ...formData, emailNewsletter: e.target.checked })}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Digest quotidien</p>
                  <p className="text-sm text-muted-foreground">Résumé quotidien des articles</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailDigest}
                  onChange={(e) => setFormData({ ...formData, emailDigest: e.target.checked })}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                />
              </label>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langue
            </h2>
            <div className="space-y-2">
              {languageOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={option.value}
                    checked={formData.locale === option.value}
                    onChange={() => handleLocaleChange(option.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              {formData.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Thème
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${formData.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Clair</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${formData.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Sombre bleu / noir</span>
              </label>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </h2>
            <div className="space-y-4">
              <button className="text-primary hover:text-primary/80 font-medium">
                Changer mon mot de passe
              </button>
              <button className="text-primary hover:text-primary/80 font-medium">
                Activer l'authentification à deux facteurs
              </button>
              <button className="text-red-600 hover:text-red-700 font-medium">
                Supprimer mon compte
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
