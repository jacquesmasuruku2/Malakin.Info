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
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#101418] shadow-[0_-12px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex h-[60px] w-full items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isButton && item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;

            if (item.isButton && item.action) {
              const isPrimary = item.primary;

              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`group relative flex w-[104px] shrink-0 flex-col items-center justify-center border-r border-white/10 transition-all duration-200 ease-out ${
                    isPrimary
                      ? 'bg-[#11181d] text-gray-200 hover:bg-[#1a252d]'
                      : 'bg-[#121a1f] text-gray-300 hover:bg-[#1a252d]'
                  }`}
                >
                  <div className={`absolute inset-x-2 top-1 h-px ${isPrimary ? 'bg-white/20' : 'bg-white/10'}`} />
                  <Icon className={`mb-1 h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105 ${isPrimary ? 'text-[#f4c51d]' : 'text-gray-300'}`} />
                  <span className={`max-w-full truncate text-[8px] font-medium uppercase tracking-[0.12em] ${isPrimary ? 'text-[#f4c51d]' : 'text-gray-300'}`}>
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href || '#'}
                className={`group relative flex w-[92px] shrink-0 flex-col items-center justify-center border-r border-white/10 px-1 text-center transition-all duration-200 hover:bg-[#1a252d] ${
                  isActive ? 'bg-[#f4c51d] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : 'bg-[#121a1f]'
                }`}
              >
                <div className={`absolute left-2 right-2 top-1 h-px ${isActive ? 'bg-white/50' : 'bg-white/10'}`} />
                <Icon className={`mb-1 h-[16px] w-[16px] transition-all duration-200 ${isActive ? 'scale-105 text-slate-950' : 'text-gray-300 group-hover:text-white'}`} />
                <span className={`max-w-full truncate text-[7.5px] font-medium uppercase tracking-[0.08em] ${isActive ? 'text-slate-950' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
