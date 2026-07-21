'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Shield, Globe, Save, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: 'fr',
    theme: 'light',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/fr/compte/connexion');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', formData);
  };

  if (!user) {
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
                  <p className="font-medium text-foreground">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">Recevoir les actualités par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Notifications push</p>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications sur votre appareil</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.pushNotifications}
                  onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
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
                  checked={formData.language === 'fr'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">Français</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={formData.language === 'en'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="text-foreground">English</span>
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
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
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
