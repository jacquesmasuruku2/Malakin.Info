'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, ChevronDown, ChevronRight, Newspaper, DollarSign, FlaskConical, Palette, Trophy, Radio, ScrollText, Briefcase, BookOpen, Info, Mail, Grid3x3, LogOut, Settings, Heart, MessageSquare, Bookmark } from 'lucide-react';
import SearchBar from './SearchBar';
import LanguageSwitcher from './LanguageSwitcher';
import { useServicesModal } from '@/contexts/ServicesModalContext';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

export default function Navigation() {
  const pathname = usePathname();
  const { isServicesOpen, openServices, closeServices } = useServicesModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';
  const t = locale === 'fr' ? frMessages.nav : enMessages.nav;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const mainNavItems = [
    { name: t.home, href: `/${locale}` },
    { name: t.news, href: `/${locale}/actualites` },
    { name: t.economy, href: `/${locale}/actualites/economie` },
    { name: t.scienceTech, href: `/${locale}/science-tech` },
    { name: t.culture, href: `/${locale}/culture` },
    { name: t.sport, href: `/${locale}/sport` },
    { name: t.supportUs, href: `/${locale}/nous-soutenir` },
  ];

  const dropdownItems = [
    { name: t.media, href: `/${locale}/medias` },
    { name: t.pressReleases, href: `/${locale}/communiques` },
    { name: t.practicalInfo, href: `/${locale}/infos-pratiques` },
    { name: t.religion, href: `/${locale}/religion` },
    { name: t.employment, href: `/${locale}/emploi` },
    { name: t.blog, href: `/${locale}/blog` },
    { name: t.about, href: `/${locale}/a-propos` },
    { name: t.contact, href: `/${locale}/contact` },
  ];

  const mobileMenuCategories = [
    {
      title: t.news,
      icon: Newspaper,
      items: [
        { name: t.allNews, href: `/${locale}/actualites` },
        { name: t.politics, href: `/${locale}/actualites/politique` },
        { name: t.economy, href: `/${locale}/actualites/economie` },
        { name: t.society, href: `/${locale}/actualites/societe` },
        { name: t.health, href: `/${locale}/actualites/sante` },
        { name: t.security, href: `/${locale}/actualites/securite` },
      ],
    },
    {
      title: t.media,
      icon: Radio,
      items: [
        { name: t.photos, href: `/${locale}/medias/photos` },
        { name: t.videos, href: `/${locale}/medias/videos` },
        { name: t.podcasts, href: `/${locale}/medias/podcasts` },
        { name: t.live, href: `/${locale}/medias/live` },
      ],
    },
    {
      title: t.religion,
      icon: ScrollText,
      items: [
        { name: t.meditations, href: `/${locale}/religion/meditations` },
        { name: t.homilies, href: `/${locale}/religion/homelies` },
        { name: t.sacredMusic, href: `/${locale}/religion/musiques-sacrees` },
        { name: t.religiousAgenda, href: `/${locale}/religion/agenda-religieux` },
        { name: t.messageOfTime, href: `/${locale}/religion/message-du-temps` },
      ],
    },
    {
      title: t.culture,
      icon: Palette,
      items: [
        { name: t.music, href: `/${locale}/culture/musique` },
        { name: t.cinema, href: `/${locale}/culture/cinema` },
        { name: t.arts, href: `/${locale}/culture/arts` },
        { name: t.trends, href: `/${locale}/culture/tendances` },
      ],
    },
    {
      title: t.sport,
      icon: Trophy,
      items: [
        { name: t.football, href: `/${locale}/sport/football` },
        { name: t.basketball, href: `/${locale}/sport/basket` },
        { name: t.athletics, href: `/${locale}/sport/athletisme` },
        { name: t.events, href: `/${locale}/sport/evenements` },
      ],
    },
    {
      title: t.scienceTech,
      icon: FlaskConical,
      items: [
        { name: t.database, href: `/${locale}/science-tech/base-de-donnees` },
        { name: t.dataAnalysis, href: `/${locale}/science-tech/analyse-de-donnees` },
        { name: t.natureEnvironment, href: `/${locale}/science-tech/nature-environnement` },
      ],
    },
    {
      title: t.employment,
      icon: Briefcase,
      items: [
        { name: t.offersBySector, href: `/${locale}/emploi/offres/sante` },
        { name: t.careerAdvice, href: `/${locale}/emploi/conseils-carriere` },
        { name: t.scholarshipsInternships, href: `/${locale}/emploi/bourses-stages` },
      ],
    },
    {
      title: t.practicalInfo,
      icon: Info,
      items: [
        { name: t.guides, href: `/${locale}/infos-pratiques/guides` },
        { name: t.tutorials, href: `/${locale}/infos-pratiques/tutoriels` },
        { name: t.resources, href: `/${locale}/infos-pratiques/ressources-educatives` },
      ],
    },
    {
      title: t.pressReleases,
      icon: Newspaper,
      items: [
        { name: t.government, href: `/${locale}/communiques/gouvernement` },
        { name: t.religious, href: `/${locale}/communiques/religieux` },
        { name: t.ngo, href: `/${locale}/communiques/ong` },
        { name: t.educational, href: `/${locale}/communiques/educatif` },
      ],
    },
    {
      title: t.blog,
      icon: BookOpen,
      items: [
        { name: t.tribunes, href: `/${locale}/blog/tribunes` },
        { name: t.chronicles, href: `/${locale}/blog/chroniques` },
        { name: t.investigations, href: `/${locale}/blog/enquetes` },
        { name: t.polls, href: `/${locale}/blog/sondages` },
      ],
    },
    {
      title: t.about,
      icon: Info,
      items: [
        { name: t.mission, href: `/${locale}/a-propos/mission` },
        { name: t.team, href: `/${locale}/a-propos/equipe` },
        { name: t.charter, href: `/${locale}/a-propos/charte` },
      ],
    },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">M</span>
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-primary">Malakin</span>
              <span className="font-heading font-bold text-xl text-secondary">.info</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            <div className="relative">
              <button
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => isDropdownOpen ? setIsDropdownOpen(false) : openServices()}
                title={t.moreServices}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-sm">{t.servicesMalakin}</h3>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Link
                      href="/admin"
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs text-white text-center">Admin</span>
                    </Link>
                    <Link
                      href={`/${locale}/recherche`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Search className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.search}</span>
                    </Link>
                    <Link
                      href={`/${locale}/communiques`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Newspaper className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.pressReleases}</span>
                    </Link>
                    <Link
                      href={`/${locale}/archives`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                        <ScrollText className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.archives}</span>
                    </Link>
                    <Link
                      href={`/${locale}/radio-afrique`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Radio className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.radioAfrica}</span>
                    </Link>
                    <Link
                      href={`/${locale}/science-tech`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                        <FlaskConical className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.scienceTech}</span>
                    </Link>
                    <Link
                      href={`/${locale}/forum-afrique`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                        <BookOpen className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.forumAfrica}</span>
                    </Link>
                    <Link
                      href={`/${locale}/partenariats`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-6 h-6 text-pink-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.partnerships}</span>
                    </Link>
                    <Link
                      href={`/${locale}/infos-pratiques`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Info className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.practicalInfo}</span>
                    </Link>
                    <Link
                      href={`/${locale}/medias`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Radio className="w-6 h-6 text-orange-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.media}</span>
                    </Link>
                    <Link
                      href={`/${locale}/blog`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-2">
                        <BookOpen className="w-6 h-6 text-teal-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.blog}</span>
                    </Link>
                    <Link
                      href={`/${locale}/emploi`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-6 h-6 text-lime-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.employment}</span>
                    </Link>
                    <Link
                      href={`/${locale}/nous-soutenir`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
                        <DollarSign className="w-6 h-6 text-rose-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.support}</span>
                    </Link>
                    <Link
                      href={`/${locale}/contact`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Mail className="w-6 h-6 text-sky-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.contact}</span>
                    </Link>
                    <Link
                      href={`/${locale}/religion`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-2">
                        <ScrollText className="w-6 h-6 text-violet-400" />
                      </div>
                      <span className="text-xs text-white text-center">{t.religion}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <button
              className="p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            <LanguageSwitcher />

            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href={`/${locale}/compte/profil`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      href={`/${locale}/compte/commentaires`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Mes commentaires</span>
                    </Link>
                    <Link
                      href={`/${locale}/compte/likes`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4" />
                      <span>Mes likes</span>
                    </Link>
                    <Link
                      href={`/${locale}/compte/favoris`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Favoris</span>
                    </Link>
                    <Link
                      href={`/${locale}/compte/parametres`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </Link>
                    <div className="border-t border-border mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/compte/connexion`}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{t.login}</span>
              </Link>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Langue / Language</span>
              <LanguageSwitcher />
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Newspaper className="w-5 h-5" />
              {t.home}
            </Link>

            {mobileMenuCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.title;

              return (
                <div key={category.title} className="border-b border-border/50">
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {category.title}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-8 pr-3 py-2 space-y-1 bg-muted/30">
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 flex items-center space-x-4 border-t border-border mt-4">
              <button 
                className="p-2 text-foreground hover:text-primary"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-foreground hover:text-primary"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <Link
                href="/compte/connexion"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{t.login}</span>
              </Link>
            </div>

            {isDropdownOpen && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm">{t.servicesMalakin}</h3>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Link
                    href="/admin"
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-white text-center">Admin</span>
                  </Link>
                  <Link
                    href={`/${locale}/recherche`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Search className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.search}</span>
                  </Link>
                  <Link
                    href={`/${locale}/communiques`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Newspaper className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.pressReleases}</span>
                  </Link>
                  <Link
                    href={`/${locale}/archives`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                      <ScrollText className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.archives}</span>
                  </Link>
                  <Link
                    href={`/${locale}/radio-afrique`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Radio className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.radioAfrica}</span>
                  </Link>
                  <Link
                    href={`/${locale}/science-tech`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                      <FlaskConical className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.scienceTech}</span>
                  </Link>
                  <Link
                    href={`/${locale}/forum-afrique`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                      <BookOpen className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.forumAfrica}</span>
                  </Link>
                  <Link
                    href={`/${locale}/partenariats`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Briefcase className="w-6 h-6 text-pink-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.partnerships}</span>
                  </Link>
                  <Link
                    href={`/${locale}/infos-pratiques`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.practicalInfo}</span>
                  </Link>
                  <Link
                    href={`/${locale}/medias`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Radio className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.media}</span>
                  </Link>
                  <Link
                    href={`/${locale}/blog`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-2">
                      <BookOpen className="w-6 h-6 text-teal-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.blog}</span>
                  </Link>
                  <Link
                    href={`/${locale}/emploi`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Briefcase className="w-6 h-6 text-lime-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.employment}</span>
                  </Link>
                  <Link
                    href={`/${locale}/nous-soutenir`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
                      <DollarSign className="w-6 h-6 text-rose-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.support}</span>
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Mail className="w-6 h-6 text-sky-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.contact}</span>
                  </Link>
                  <Link
                    href={`/${locale}/religion`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-2">
                      <ScrollText className="w-6 h-6 text-violet-400" />
                    </div>
                    <span className="text-xs text-white text-center">{t.religion}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
