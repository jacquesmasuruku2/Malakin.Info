'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderOpen,
  Hash
} from 'lucide-react';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Politique',
      slug: 'politique',
      description: 'Actualités politiques et gouvernementales',
      color: '#3B82F6',
      articleCount: 45,
      createdAt: '2026-01-15',
    },
    {
      id: 2,
      name: 'Économie',
      slug: 'economie',
      description: 'Nouvelles économiques et financières',
      color: '#10B981',
      articleCount: 32,
      createdAt: '2026-01-15',
    },
    {
      id: 3,
      name: 'Santé',
      slug: 'sante',
      description: 'Santé, médecine et bien-être',
      color: '#EF4444',
      articleCount: 27,
      createdAt: '2026-01-16',
    },
    {
      id: 4,
      name: 'Sport',
      slug: 'sport',
      description: 'Actualités sportives et compétitions',
      color: '#F59E0B',
      articleCount: 28,
      createdAt: '2026-01-16',
    },
    {
      id: 5,
      name: 'Culture',
      slug: 'culture',
      description: 'Arts, musique et culture',
      color: '#8B5CF6',
      articleCount: 24,
      createdAt: '2026-01-17',
    },
    {
      id: 6,
      name: 'Science & Tech',
      slug: 'science-tech',
      description: 'Innovations scientifiques et technologiques',
      color: '#06B6D4',
      articleCount: 18,
      createdAt: '2026-01-17',
    },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
            <p className="text-gray-600 mt-1">Gérer les catégories d'articles</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle catégorie</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="h-2"
                style={{ backgroundColor: category.color }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <FolderOpen className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">/{category.slug}</p>
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
                
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Hash className="w-4 h-4 mr-1" />
                    <span>{category.articleCount} articles</span>
                  </div>
                  <span className="text-gray-400">Créé le {category.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
