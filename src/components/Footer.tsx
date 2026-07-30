'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin } from 'lucide-react';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';
  const t = locale === 'fr' ? frMessages.footer : enMessages.footer;
  const nav = locale === 'fr' ? frMessages.nav : enMessages.nav;

  return (
    <footer className="bg-black text-white">
      {/* Red accent bar */}
      <div className="h-1 bg-red-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Dans l'actualité + Rubriques */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.inTheNews}</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/actualites/politique`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    {nav.politics}
                  </Link>
                  <Link href={`/${locale}/actualites/economie`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    {nav.economy}
                  </Link>
                </div>
                <Link href={`/${locale}/actualites`} className="border border-white text-white px-3 py-2 text-xs text-center block hover:bg-white hover:text-black transition-colors">
                  {t.africanNews2026}
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/actualites/societe`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    {nav.society}
                  </Link>
                  <Link href={`/${locale}/actualites/sante`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    {nav.health}
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.sections}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Link href={`/${locale}/actualites/securite`} className="text-gray-300 hover:text-white block">{nav.security}</Link>
                  <Link href={`/${locale}/actualites/environnement`} className="text-gray-300 hover:text-white block">{nav.environment}</Link>
                  <Link href={`/${locale}/culture`} className="text-gray-300 hover:text-white block">{nav.culture}</Link>
                </div>
                <div className="space-y-1">
                  <Link href={`/${locale}/sport`} className="text-gray-300 hover:text-white block">{nav.sport}</Link>
                  <Link href={`/${locale}/emploi`} className="text-gray-300 hover:text-white block">{nav.employment}</Link>
                  <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white block">{nav.blog}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: À propos de Malakin */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.aboutMalakin}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Link href={`/${locale}/a-propos`} className="text-gray-300 hover:text-white block">{t.whoAreWe}</Link>
                <Link href={`/${locale}/a-propos/mission`} className="text-gray-300 hover:text-white block">{t.ourMission}</Link>
                <Link href={`/${locale}/a-propos/equipe`} className="text-gray-300 hover:text-white block">{t.ourTeam}</Link>
              </div>
              <div className="space-y-1">
                <Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white block">{nav.contact}</Link>
                <Link href={`/${locale}/partenariats`} className="text-gray-300 hover:text-white block">{t.advertising}</Link>
                <Link href={`/${locale}/nous-soutenir`} className="text-gray-300 hover:text-white block">{nav.supportUs}</Link>
              </div>
            </div>
          </div>

          {/* Column 3: Réseau Malakin Media */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.malakinMediaNetwork}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Link href="#" className="text-gray-300 hover:text-white block">{t.malakinRadioAfrica}</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">{t.focusEco}</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">{t.youthTribune}</Link>
              </div>
              <div className="space-y-1">
                <Link href="#" className="text-gray-300 hover:text-white block">{t.malakinDocu}</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">{t.mediaObservatory}</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">{t.partnerships}</Link>
              </div>
            </div>
          </div>

          {/* Column 4: Services + Applications */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.services}</h3>
              <div className="space-y-1 text-xs">
                <Link href="#" className="text-gray-300 hover:text-white block">{t.newsletters}</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">{t.rssFeeds}</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">{t.applications}</h3>
              <p className="text-xs text-gray-300 mb-3">{t.downloadApp}</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">F24</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">MCD</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">FMM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-gray-700 mt-8 pt-4 mb-4">
          <div className="flex flex-wrap gap-4 text-xs text-gray-300">
            <Link href={`/${locale}/mentions-legales`} className="hover:text-white">{t.legalNotices}</Link>
            <Link href={`/${locale}/politique-confidentialite`} className="hover:text-white">{t.privacyPolicy}</Link>
            <Link href={`/${locale}/conditions-utilisation`} className="hover:text-white">{t.termsOfUse}</Link>
            <Link href={`/${locale}/cookies`} className="hover:text-white">{t.cookies}</Link>
            <Link href="#" className="hover:text-white">{t.notifications}</Link>
          </div>
        </div>

        {/* Social media bar */}
        <div className="border-t border-gray-700 pt-4 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
            <span className="hover:text-white cursor-pointer">Facebook</span>
            <span className="hover:text-white cursor-pointer">Bluesky</span>
            <span className="hover:text-white cursor-pointer">Threads</span>
            <span className="hover:text-white cursor-pointer">Instagram</span>
            <span className="hover:text-white cursor-pointer">YouTube</span>
            <span className="hover:text-white cursor-pointer">TikTok</span>
            <span className="hover:text-white cursor-pointer">WhatsApp</span>
            <span className="hover:text-white cursor-pointer">Telegram</span>
            
            <div className="border-l border-gray-700 pl-4 ml-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">{t.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">{t.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">{t.location}</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400 text-right">
          <p>© {currentYear} MalakInfo.com. {t.copyright} | {t.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
