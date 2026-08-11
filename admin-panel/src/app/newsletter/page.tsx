'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Mail, Search, Eye } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function NewsletterSubscribersPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/newsletter'));
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subs.filter((s) => s.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Abonnés newsletter</h1>
          <p className="text-secondary mt-1">Liste des personnes abonnées à la newsletter</p>
        </div>

        <div className="card rounded-lg shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonné le</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Aucun abonné trouvé</td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{s.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.isActive ? 'Oui' : 'Non'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.subscribedAt).toLocaleString('fr-FR')}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 p-1"><Eye className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
