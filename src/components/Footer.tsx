'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ChevronRight, ArrowUp, Globe, Sparkles, Award, Users, Radio, TrendingUp, BookOpen, Newspaper, Music, Film, Briefcase, Heart, Share2, Smartphone, Download, Camera, Mic, Coffee, MessageCircle, Send, Video, MessageSquare } from 'lucide-react';
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
    Website: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      color: '#0F172A',
      url: 'https://www.malakinfo.com',
    },
    Facebook: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: '#1877F2',
      url: 'https://www.facebook.com/profile.php?id=61593119312402',
    },
    X: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
      ),
      color: '#000000',
      url: 'https://x.com/Malakinfo1',
    },
    Instagram: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="igGradientFooter" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="#FFD600"/>
              <stop offset="25%" stop-color="#FF7A00"/>
              <stop offset="50%" stop-color="#FF0069"/>
              <stop offset="75%" stop-color="#D300C5"/>
              <stop offset="100%" stop-color="#7638FA"/>
            </linearGradient>
          </defs>
          <path fill="url(#igGradientFooter)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: '#E1306C',
      url: 'https://www.instagram.com/malakinfo/',
    },
    WhatsApp: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: '#25D366',
      url: 'https://wa.me/243998258441',
    },
    Telegram: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: '#0088cc',
      url: 'https://t.me/',
    },
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
            className="fixed bottom-20 right-4 z-[60] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 group sm:bottom-8 sm:right-8"
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
                    href={`/${locale}/politique`}
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('politics')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.politics}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </Link>
                  <Link 
                    href={`/${locale}/economie`}
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
                    href={`/${locale}/societe`}
                    className="group relative border border-white/20 text-white px-3 py-2.5 text-xs text-center hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 overflow-hidden"
                    onMouseEnter={() => setHoveredItem('society')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.society}</span>
                    <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </Link>
                  <Link 
                    href={`/${locale}/sante`}
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
                      href={`/${locale}/${['securite', 'environnement', 'culture'][index]}`}
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
                  <Icon />
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