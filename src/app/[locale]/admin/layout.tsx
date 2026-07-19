'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Newspaper,
  Radio,
  BookOpen,
  Briefcase,
  DollarSign,
  Mail,
  Shield
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { name: 'Tableau de bord', href: `/${locale}/admin`, icon: LayoutDashboard },
    { name: 'Articles', href: `/${locale}/admin/articles`, icon: FileText },
    { name: 'Catégories', href: `/${locale}/admin/categories`, icon: FolderOpen },
    { name: 'Auteurs', href: `/${locale}/admin/authors`, icon: Users },
    { name: 'Médias', href: `/${locale}/admin/media`, icon: Radio },
    { name: 'Blog', href: `/${locale}/admin/blog`, icon: BookOpen },
    { name: 'Emploi', href: `/${locale}/admin/jobs`, icon: Briefcase },
    { name: 'Dons', href: `/${locale}/admin/donations`, icon: DollarSign },
    { name: 'Contact', href: `/${locale}/admin/contact`, icon: Mail },
    { name: 'Paramètres', href: `/${locale}/admin/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center space-x-2 p-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-primary">Malakin</span>
                <span className="font-heading font-bold text-xl text-secondary">.info</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Link
                href={`/${locale}`}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
