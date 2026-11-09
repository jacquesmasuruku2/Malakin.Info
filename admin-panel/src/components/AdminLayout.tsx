'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Inbox,
  Briefcase,
  Handshake,
  Mail,
  Send,
  ListVideo,
  Video,
  ExternalLink,
  ClipboardList,
  Radio,
  Music,
  ChevronLeft,
  ChevronRight,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    { name: 'Émissions radio', href: '/radio/programs', icon: ListVideo },
    { name: 'Lives', href: '/lives', icon: Video },
    { name: 'Médias', href: '/media', icon: Music },
    { name: 'Partenaires', href: '/partnerships', icon: Handshake },
    { name: 'Sponsors', href: '/sponsored', icon: Handshake },
    { name: 'Abonnement', href: '/newsletter', icon: Mail },
    { name: 'Envoyer une newsletter', href: '/newsletter/send', icon: Send },
    { name: 'Soumissions', href: '/form-submissions', icon: Inbox },
    { name: 'Offres d\'emploi', href: '/job-offers', icon: Briefcase },
    { name: 'Candidatures', href: '/job-applications', icon: ClipboardList },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];
  const activeHref = sidebarItems
    .filter((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;

  return (
    <div className="admin-shell min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Mobile header */}
      <div className={`sticky top-0 z-40 border-b px-4 py-2.5 transition-transform duration-200 lg:hidden ${isEditorToolbarActive ? '-translate-y-full' : 'translate-y-0'}`} style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 text-secondary transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex min-w-0 items-center justify-center" aria-label="MalakInfo, tableau de bord">
            <Image src="https://malakinfo.com/images/logo.png" alt="MalakInfo" width={2160} height={700} unoptimized className="h-9 w-32 object-contain" />
          </Link>
          <span className="w-9" aria-hidden="true" />
        </div>
      </div>

      <div className="flex min-w-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,16rem)] transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', borderRightWidth: 1 }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`relative flex min-h-[76px] items-center border-b py-3 ${isSidebarCollapsed ? 'gap-1 px-2' : 'gap-3 px-4 lg:px-5'}`} style={{ borderColor: 'var(--sidebar-border)' }}>
              <Link href="/" className={`flex min-w-0 items-center ${isSidebarCollapsed ? 'shrink-0' : 'flex-1'}`} aria-label="MalakInfo, tableau de bord">
                <Image
                  src="https://malakinfo.com/images/logo.png"
                  alt="MalakInfo"
                  width={2160}
                  height={700}
                  unoptimized
                  className={`object-contain ${isSidebarCollapsed ? 'h-5 w-8' : 'h-11 w-40'}`}
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
                className={`hidden items-center justify-center rounded-lg text-secondary transition-colors hover:bg-black/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] lg:inline-flex ${isSidebarCollapsed ? 'ml-auto p-1' : 'p-2'}`}
                aria-label={isSidebarCollapsed ? 'Afficher les libellés du menu' : 'Masquer les libellés du menu'}
                title={isSidebarCollapsed ? 'Afficher les libellés' : 'Masquer les libellés'}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigation principale">
              <ul className="space-y-1.5">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeHref === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'}`}
                        title={isSidebarCollapsed ? item.name : undefined}
                        style={{
                          backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                          boxShadow: isActive ? 'inset 3px 0 0 var(--primary)' : undefined,
                        }}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className={isSidebarCollapsed ? 'hidden' : ''}>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className={`border-t p-4 ${isSidebarCollapsed ? 'lg:px-2' : ''}`} style={{ borderColor: 'var(--sidebar-border)' }}>
              <button
                type="button"
                onClick={handleLogout}
                className={`flex w-full items-center rounded-md py-3 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'}`}
                title={isSidebarCollapsed ? 'Se déconnecter' : undefined}
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="w-5 h-5" />
                <span className={isSidebarCollapsed ? 'hidden' : ''}>Se déconnecter</span>
              </button>
              <a
                href="https://malakinfo.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 flex items-center rounded-md py-3 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'}`}
                title={isSidebarCollapsed ? 'Retour au site' : undefined}
                style={{ color: 'var(--text-secondary)' }}
              >
                <ExternalLink className="w-5 h-5" />
                <span className={isSidebarCollapsed ? 'hidden' : ''}>Retour au site</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main className={`min-w-0 flex-1 min-h-screen transition-[margin] duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
