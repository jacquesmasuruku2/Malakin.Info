'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare,
  Briefcase,
  Radio
  ,Music
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditorToolbarActive, setIsEditorToolbarActive] = useState(false);

  useEffect(() => {
    const handleEditorToolbarVisibility = (event: Event) => {
      setIsEditorToolbarActive((event as CustomEvent<boolean>).detail);
    };

    window.addEventListener('editor-toolbar-visibility', handleEditorToolbarVisibility);
    return () => window.removeEventListener('editor-toolbar-visibility', handleEditorToolbarVisibility);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const sidebarItems = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Articles', href: '/articles', icon: FileText },
    { name: 'Catégories', href: '/categories', icon: FolderOpen },
    { name: 'Auteurs', href: '/authors', icon: Users },
    { name: 'Radio', href: '/radio', icon: Radio },
    { name: 'Émissions radio', href: '/radio/programs', icon: Radio },
    { name: 'Lives', href: '/lives', icon: Radio },
    { name: 'Médias', href: '/media', icon: Music },
    { name: 'Sponsors', href: '/sponsored', icon: Briefcase },
    { name: 'Newsletter', href: '/newsletter', icon: MessageSquare },
    { name: 'Envoyer une newsletter', href: '/newsletter/send', icon: Briefcase },
    { name: 'Soumissions', href: '/form-submissions', icon: MessageSquare },
    { name: 'Offres d\'emploi', href: '/job-offers', icon: Briefcase },
    { name: 'Candidatures', href: '/job-applications', icon: Briefcase },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Mobile header */}
      <div className={`sticky top-0 z-40 lg:hidden bg-white border-b border-gray-200 px-4 py-3 transition-transform duration-200 ${isEditorToolbarActive ? '-translate-y-full' : 'translate-y-0'}`}>
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

      <div className="flex min-w-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center space-x-2 p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl" style={{ color: 'var(--primary)' }}>Malakin</span>
                <span className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>.info</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors"
                        style={{
                          backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                        }}
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
            <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-red-50 hover:text-red-600"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="w-5 h-5" />
                <span>Se déconnecter</span>
              </button>
              <a
                href="https://malakin-info.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 hover:text-red-600"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="w-5 h-5" aria-hidden="true" />
                <span>Retour au site</span>
              </a>
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
        <main className="min-w-0 flex-1 min-h-screen lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
