'use client';

import AdminLayout from '@/components/AdminLayout';
import { useTheme } from '@/components/ThemeProvider';
import { 
  User, 
  Database, 
  Globe, 
  Bell,
  Shield,
  Key,
  Palette
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'Bleu', value: 'blue', color: 'bg-blue-600' },
    { name: 'Gris', value: 'gray', color: 'bg-gray-600' },
    { name: 'Sombre', value: 'dark', color: 'bg-gray-900' },
    { name: 'Vert', value: 'green', color: 'bg-green-600' },
    { name: 'Violet', value: 'purple', color: 'bg-purple-600' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérer les paramètres du panneau d'administration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Apparence</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thème de couleur
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as any)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        theme === t.value 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${t.color} mb-2`} />
                      <span className="text-xs text-gray-700">{t.name}</span>
                      {theme === t.value && (
                        <span className="text-xs text-blue-600 mt-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Général</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du site
                </label>
                <input
                  type="text"
                  defaultValue="Malakinfo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  defaultValue="contact@malakinfo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Enregistrer
              </button>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Base de données</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de connexion
                </label>
                <input
                  type="text"
                  defaultValue="postgresql://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut de connexion</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Connecté
                </span>
              </div>
              <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors">
                Tester la connexion
              </button>
            </div>
          </div>

          {/* User Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Utilisateur</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  defaultValue="admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@malakinfo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Mettre à jour
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors">
                Changer le mot de passe
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notifications par email</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Alertes de sécurité</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Rapports hebdomadaires</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Enregistrer les préférences
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Clés API</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clé API publique
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    defaultValue="pk_live_xxxxxxxxxxxx"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50"
                    readOnly
                  />
                  <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Copier
                  </button>
                </div>
              </div>
              <button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors">
                Régénérer la clé API
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
