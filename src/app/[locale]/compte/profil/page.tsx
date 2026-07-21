'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Edit, Save, X, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/fr/compte/connexion');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      bio: parsedUser.bio || '',
    });
  }, [router]);

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
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
      email: user.email || '',
      bio: user.bio || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

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
                <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-16 h-16 text-primary" />
                </div>
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
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    user.email
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Annuler' : 'Modifier le profil'}
              </button>
            </div>

            {/* Bio */}
            <div className="mb-6">
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Commentaires</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
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
