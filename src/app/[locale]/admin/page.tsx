'use client';

import { useLocale } from 'next-intl';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Clock,
  FolderOpen
} from 'lucide-react';

export default function AdminDashboard() {
  const locale = useLocale();

  const stats = [
    {
      name: 'Total Articles',
      value: '156',
      change: '+12%',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Auteurs',
      value: '24',
      change: '+2',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Vues ce mois',
      value: '45.2K',
      change: '+18%',
      icon: Eye,
      color: 'bg-purple-500',
    },
    {
      name: 'Taux de croissance',
      value: '+23%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const recentArticles = [
    {
      id: 1,
      title: 'Nouvelles avancées dans le secteur technologique en Afrique',
      category: 'Science & Tech',
      author: 'Marie Curie',
      date: '2026-07-19',
      status: 'Publié',
      views: 1234,
    },
    {
      id: 2,
      title: 'Les élections présidentielles : analyse complète',
      category: 'Politique',
      author: 'Jean Dupont',
      date: '2026-07-18',
      status: 'Publié',
      views: 2345,
    },
    {
      id: 3,
      title: 'Impact économique des nouvelles mesures fiscales',
      category: 'Économie',
      author: 'Paul Mbemba',
      date: '2026-07-17',
      status: 'En révision',
      views: 876,
    },
    {
      id: 4,
      title: 'Innovations dans le domaine de la santé',
      category: 'Santé',
      author: 'Sophie Nkosi',
      date: '2026-07-16',
      status: 'Brouillon',
      views: 0,
    },
    {
      id: 5,
      title: 'Championnat africain de football : résultats',
      category: 'Sport',
      author: 'Jean Dupont',
      date: '2026-07-15',
      status: 'Publié',
      views: 3456,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre site</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{stat.change}</span>
                <span className="text-gray-500 ml-2">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Articles récents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {article.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{article.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{article.author}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {article.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.status === 'Publié' 
                        ? 'bg-green-100 text-green-800' 
                        : article.status === 'En révision'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye className="w-4 h-4 mr-2" />
                      {article.views.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-200">
          <button className="text-sm font-medium text-primary hover:text-primary/80">
            Voir tous les articles →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Nouvel article
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors">
              <Users className="w-4 h-4 mr-2" />
              Ajouter un auteur
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <FolderOpen className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques par catégorie</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Politique</span>
              <span className="text-sm font-medium text-gray-900">45 articles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Économie</span>
              <span className="text-sm font-medium text-gray-900">32 articles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sport</span>
              <span className="text-sm font-medium text-gray-900">28 articles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Culture</span>
              <span className="text-sm font-medium text-gray-900">24 articles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Santé</span>
              <span className="text-sm font-medium text-gray-900">27 articles</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="text-sm text-gray-900">Nouvel article publié</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="text-sm text-gray-900">Nouvel auteur ajouté</p>
                <p className="text-xs text-gray-500">Il y a 5 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
              <div>
                <p className="text-sm text-gray-900">Article mis à jour</p>
                <p className="text-xs text-gray-500">Il y a 8 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
              <div>
                <p className="text-sm text-gray-900">Nouvelle catégorie créée</p>
                <p className="text-xs text-gray-500">Hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
