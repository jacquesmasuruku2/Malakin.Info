'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, Music, Trophy, Grip } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  const navItems = [
    {
      name: locale === 'fr' ? 'La une' : 'Featured',
      icon: Home,
      href: `/${locale}`,
    },
    {
      name: locale === 'fr' ? 'Podcasts' : 'Podcasts',
      icon: Radio,
      href: `/${locale}/medias/podcasts`,
    },
    {
      name: locale === 'fr' ? 'Musique' : 'Music',
      icon: Music,
      href: `/${locale}/culture/musique`,
    },
    {
      name: locale === 'fr' ? 'Sports' : 'Sports',
      icon: Trophy,
      href: `/${locale}/sport`,
    },
    {
      name: locale === 'fr' ? 'Menu' : 'Menu',
      icon: Grip,
      href: `/${locale}/recherche`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`w-5 h-5 mb-1 ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? 'text-primary font-medium' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
