'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ChevronRight, ArrowUp, Globe, Sparkles, Award, Users, Radio, TrendingUp, BookOpen, Newspaper, Music, Film, Briefcase, Heart, Share2, Smartphone, Download, Camera, Mic, Coffee, MessageCircle, Send, Video, MessageSquare } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaTiktok, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const t = messages.footer;
  const nav = messages.nav;

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Social media icons mapping with official icons and URLs
  const socialIcons = {
    Facebook: { icon: FaFacebook, color: '#1877F2', url: 'https://www.facebook.com/profile.php?id=61593119312402' },
    Bluesky: { icon: MessageCircle, color: '#0085ff', url: '#' },
    Threads: { icon: MessageSquare, color: '#000000', url: '#' },
    Instagram: { icon: FaInstagram, color: '#E4405F', url: '#' },
    YouTube: { icon: FaYoutube, color: '#FF0000', url: '#' },
    TikTok: { icon: Video, color: '#000000', url: '#' },
    WhatsApp: { icon: FaWhatsapp, color: '#25D366', url: 'https://wa.me/243998258441' },
    Telegram: { icon: FaTelegram, color: '#0088cc', url: '#' }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-black to-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-600 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Red accent bar with gradient */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient-x"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 group"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Dans l'actualité + Rubriques */}
          <div className="space-y-8 border-r border-gray-700/50 pr-0 md:pr-8 last:border-r-0 last:pr-0">
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-red-500" />
                {t.inTheNews}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/${locale}/actualites/politique`} 
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('politics')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.politics}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </Link>
                  <Link 
                    href={`/${locale}/actualites/economie`} 
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('economy')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.economy}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300" />
                  </Link>
                </div>
                <Link 
                  href={`/${locale}/actualites`} 
                  className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center block hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 overflow-hidden"
                  onMouseEnter={() => setHoveredItem('allNews')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {t.africanNews2026}
                  </span>
                  <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/${locale}/actualites/societe`} 
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('society')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.society}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </Link>
                  <Link 
                    href={`/${locale}/actualites/sante`} 
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('health')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.health}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                {t.sections}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-2">
                  {[nav.security, nav.environment, nav.culture].map((item, index) => (
                    <Link 
                      key={index}
                      href={`/${locale}/actualites/${['securite', 'environnement', 'culture'][index]}`} 
                      className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:translate-x-2 hover:scale-105 flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                      {item}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2">
                  {[nav.sport, nav.employment, nav.blog].map((item, index) => (
                    <Link 
                      key={index}
                      href={`/${locale}/${['sport', 'emploi', 'blog'][index]}`} 
                      className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:translate-x-2 hover:scale-105 flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: À propos de Malakin */}
          <div className="border-r border-gray-700/50 pr-0 md:pr-8 last:border-r-0 last:pr-0">
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              {t.aboutMalakin}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                {[t.whoAreWe, t.ourMission, t.ourTeam].map((item, index) => (
                  <Link 
                    key={index}
                    href={`/${locale}/a-propos/${['', 'mission', 'equipe'][index]}`} 
                    className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:translate-x-2 flex items-center gap-1 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full group-hover:scale-150 transition-transform" />
                    {item}
                  </Link>
                ))}
              </div>
              <div className="space-y-2">
                {[nav.contact, t.advertising, nav.supportUs].map((item, index) => (
                  <Link 
                    key={index}
                    href={`/${locale}/${['contact', 'partenariats', 'nous-soutenir'][index]}`} 
                    className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:translate-x-2 flex items-center gap-1 group"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full group-hover:scale-150 transition-transform" />
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Support us badge */}
            <div className="mt-6 p-4 bg-gradient-to-r from-red-600/20 to-red-600/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-xs text-gray-300">Soutenez l'information indépendante</span>
              </div>
            </div>
          </div>

          {/* Column 3: Réseau Malakin Media */}
          <div className="border-r border-gray-700/50 pr-0 md:pr-8 last:border-r-0 last:pr-0">
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-400 animate-pulse" />
              {t.malakinMediaNetwork}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                {[t.malakinRadioAfrica, t.focusEco, t.youthTribune].map((item, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/10 p-2 rounded hover:bg-red-600/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">●</span>
                      {item}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="space-y-2">
                {[t.malakinDocu, t.mediaObservatory, t.partnerships].map((item, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 p-2 rounded hover:bg-blue-600/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">◆</span>
                      {item}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4: Services */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              {t.services}
            </h3>
            <div className="space-y-2 text-xs">
              {[t.newsletters, t.rssFeeds].map((item, index) => (
                <Link 
                  key={index}
                  href="#" 
                  className="text-gray-300 hover:text-white block transition-all duration-300 transform hover:scale-105 p-2 rounded hover:bg-gradient-to-r hover:from-red-600/20 hover:to-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-red-400" />
                    {item}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal bar with animated separator */}
        <div className="border-t border-gray-800/50 mt-12 pt-6 mb-4 relative">
          <div className="absolute -top-px left-0 w-1/4 h-px bg-gradient-to-r from-red-500 to-transparent"></div>
          <div className="flex flex-wrap gap-6 text-xs text-gray-300">
            {[
              t.legalNotices,
              t.privacyPolicy,
              t.termsOfUse,
              t.cookies,
              t.notifications
            ].map((item, index) => (
              <Link 
                key={index}
                href={`/${locale}/${['mentions-legales', 'politique-confidentialite', 'conditions-utilisation', 'cookies', '#'][index]}`} 
                className="hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 px-2 py-1 rounded hover:bg-red-600/10"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Social media bar with interactive icons */}
        <div className="border-t border-gray-800/50 pt-6 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
            {Object.entries(socialIcons).map(([name, { icon: Icon, color, url }]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white cursor-pointer transition-all duration-300 transform hover:scale-125 hover:shadow-lg hover:shadow-red-500/20 px-2 py-1 rounded hover:bg-red-600/10 group flex items-center gap-2"
                onMouseEnter={() => setHoveredItem(name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span style={{ color }}>
                  <Icon className="w-4 h-4" />
                </span>
                {name}
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[8px] text-red-400 block">●</span>
              </a>
            ))}
            
            <div className="border-l border-gray-700/50 pl-4 ml-2 flex flex-wrap items-center gap-4">
              <a href="mailto:contact@malakinfo.com" className="flex items-center gap-2 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <Mail className="w-4 h-4 text-red-400 group-hover:animate-pulse" />
                <span className="hover:text-white">{t.contactEmail}</span>
              </a>
              <a href="tel:+243998258441" className="flex items-center gap-2 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <Phone className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                <span>+243 998 258 441</span>
              </a>
              <div className="flex items-center gap-2 hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                <MapPin className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
                <span>{t.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright with animated gradient */}
        <div className="relative text-xs text-gray-400 text-right pt-4 border-t border-gray-800/50">
          <div className="absolute -top-px right-0 w-1/4 h-px bg-gradient-to-l from-red-500 to-transparent"></div>
          <p className="flex items-center justify-end gap-2">
            <span>© {currentYear} MalakInfo.com</span>
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
            <span>{t.copyright}</span>
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse delay-500"></span>
            <span>{t.madeWith}</span>
            <Heart className="w-3 h-3 text-red-500 inline animate-pulse" />
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}