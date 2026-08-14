'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Calendar, Edit, Save, X, Camera, LogOut, MessageSquare, Heart, Bookmark, DollarSign, Settings, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ProfilePage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (session?.user) {
      setUser(session.user);
      setFormData({
        name: session.user.name || '',
        bio: session.user.bio || '',
      });
      return;
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          bio: parsedUser.bio || '',
        });
      } catch {
        setUser(null);
      }
    }
  }, [session]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || !user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const menuItems = [
    {
      icon: MessageSquare,
      label: 'Mes commentaires',
      count: user._count?.comments || 0,
      href: `/${locale}/compte/commentaires`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      label: 'Mes likes',
      count: user._count?.likes || 0,
      href: `/${locale}/compte/likes`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Bookmark,
      label: 'Favoris',
      count: user._count?.favorites || 0,
      href: `/${locale}/compte/favoris`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: DollarSign,
      label: 'Mes dons',
      count: user._count?.donations || 0,
      href: `/${locale}/compte/dons`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      count: null,
      href: `/${locale}/compte/parametres`,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 h-32"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6 gap-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    user.name
                  )}
                </h1>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Membre depuis {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Récent'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-2">À propos</h2>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Parlez-nous de vous..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">
                  {user.bio || 'Aucune biographie renseignée.'}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user._count?.comments || 0}</p>
                <p className="text-sm text-muted-foreground">Commentaires</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user._count?.likes || 0}</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user._count?.favorites || 0}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user._count?.donations || 0}</p>
                <p className="text-sm text-muted-foreground">Dons</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Mon compte</h2>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        {item.count !== null && (
                          <p className="text-sm text-muted-foreground">{item.count} élément{item.count > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                );
              })}
            </div>

            {/* Save Button */}
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
