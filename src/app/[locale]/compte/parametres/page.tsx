'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Settings, Bell, Shield, Globe, Save, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    emailNewsletter: false,
    emailDigest: false,
    locale: 'fr',
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          emailNewsletter: data.emailNewsletter || false,
          emailDigest: data.emailDigest || false,
          locale: data.locale || 'fr',
          theme: data.theme || 'light',
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Préférences enregistrées avec succès');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences de compte</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
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

          {/* Language */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langue
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="fr"
                  checked={formData.locale === 'fr'}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Français</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={formData.locale === 'en'}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">English</span>
              </label>
            </div>
          </div>

          {/* Theme */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Thème
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Clair</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Sombre</span>
              </label>
            </div>
          </div>

          {/* Security */}
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

          {/* Save Button */}
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
              className="flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
