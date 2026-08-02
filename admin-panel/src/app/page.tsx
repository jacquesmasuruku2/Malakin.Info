import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  BarChart3,
  LayoutDashboard
} from 'lucide-react';

export default function AdminDashboard() {
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
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      name: 'Taux de croissance',
      value: '+23%',
      change: '+5%',
      icon: LayoutDashboard,
      color: 'bg-orange-500',
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/articles/new" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Nouvel article
              </Link>
              <Link href="/authors/new" className="flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">
                <Users className="w-4 h-4 mr-2" />
                Ajouter un auteur
              </Link>
              <Link href="/categories/new" className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
