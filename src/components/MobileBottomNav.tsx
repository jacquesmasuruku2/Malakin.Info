'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Grip, Play, Briefcase, Radio, ShoppingBag, Mail } from 'lucide-react';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = getMessages(locale).nav;
  const { openServices } = useServicesModal();
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    {
      name: 'Radio',
      icon: Radio,
      action: () => window.dispatchEvent(new CustomEvent('malakinfo-radio-toggle')),
      isButton: true,
      primary: true,
    },
    {
      name: t.jobOffers,
      icon: Briefcase,
      href: `/${locale}/emploi`,
      primary: false,
    },
    {
      name: t.directs,
      icon: Radio,
      href: `/${locale}/medias/live`,
      primary: false,
    },
    {
      name: t.shopping,
      icon: ShoppingBag,
      href: `/${locale}/boutique`,
      primary: false,
    },
    {
      name: t.newsletter,
      icon: Mail,
      href: `/${locale}/newsletter`,
      primary: false,
    },
    {
      name: t.menu,
      icon: Grip,
      action: openServices,
      isButton: true,
      primary: false,
    },
  ];

  useEffect(() => {
    const startHideTimer = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };

    startHideTimer();

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleTouch = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('click', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('click', handleTouch);
    };
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-neutral-900 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex h-14 items-stretch overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isButton && item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;

          if (item.isButton && item.action) {
            const isPrimary = item.primary;

            return (
              <button
                key={item.name}
                onClick={item.action}
                className={`flex min-w-[84px] flex-1 flex-col items-center justify-center border-r border-white/10 transition-colors ${
                  isPrimary
                    ? 'bg-primary text-slate-950'
                    : 'bg-neutral-900 text-gray-300'
                }`}
              >
                <Icon className={`mb-0.5 h-4 w-4 ${isPrimary ? 'text-slate-950' : 'text-gray-300'}`} />
                <span className={`text-[9px] font-medium uppercase tracking-[0.08em] ${isPrimary ? 'text-slate-950' : 'text-gray-300'}`}>
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href || '#'}
              className="flex min-w-[74px] flex-1 flex-col items-center justify-center border-r border-white/10 bg-neutral-900 text-gray-300 transition-colors hover:text-white"
            >
              <Icon className={`mb-0.5 h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-300'}`} />
              <span className={`text-[9px] uppercase tracking-[0.06em] ${isActive ? 'font-medium text-primary' : 'text-gray-300'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
