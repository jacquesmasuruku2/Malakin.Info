'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Mail,
  FileText,
  Calendar
} from 'lucide-react';

export default function AuthorsPage() {
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState('');

  const authors = [
    {
      id: 1,
      name: 'Marie Curie',
      slug: 'marie-curie',
      email: 'marie.curie@example.com',
      role: 'Rédactrice en chef',
      bio: 'Journaliste spécialisée en science et technologie',
      avatar: null,
      articleCount: 32,
      createdAt: '2026-01-15',
    },
    {
      id: 2,
      name: 'Jean Dupont',
      slug: 'jean-dupont',
      email: 'jean.dupont@example.com',
      role: 'Journaliste politique',
      bio: 'Expert en politique africaine et relations internationales',
      avatar: null,
      articleCount: 28,
      createdAt: '2026-01-16',
    },
    {
      id: 3,
      name: 'Paul Mbemba',
      slug: 'paul-mbemba',
      email: 'paul.mbemba@example.com',
      role: 'Économiste',
      bio: 'Analyste économique spécialisé en Afrique centrale',
      avatar: null,
      articleCount: 24,
      createdAt: '2026-01-17',
    },
    {
      id: 4,
      name: 'Sophie Nkosi',
      slug: 'sophie-nkosi',
      email: 'sophie.nkosi@example.com',
      role: 'Journaliste santé',
      bio: 'Spécialiste en santé publique et médecine',
      avatar: null,
      articleCount: 18,
      createdAt: '2026-01-18',
    },
  ];

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auteurs</h1>
          <p className="text-gray-600 mt-1">Gérer les auteurs et rédacteurs</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nouvel auteur</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <div key={author.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
                    <p className="text-xs text-gray-500">/{author.slug}</p>
                    <p className="text-sm text-primary mt-1">{author.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{author.bio}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{author.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{author.articleCount} articles</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Membre depuis {author.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAuthors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun auteur trouvé</p>
        </div>
      )}
    </div>
  );
}
