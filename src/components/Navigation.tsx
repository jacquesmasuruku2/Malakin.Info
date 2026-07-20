'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, ChevronDown, ChevronRight, Newspaper, DollarSign, FlaskConical, Palette, Trophy, Radio, ScrollText, Briefcase, BookOpen, Info, Mail, Grid3x3 } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';

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
    { name: 'Accueil', href: `/${locale}` },
    { name: 'Actualités', href: `/${locale}/actualites` },
    { name: 'Économie', href: `/${locale}/actualites/economie` },
    { name: 'Science & Tech', href: `/${locale}/science-tech` },
    { name: 'Culture', href: `/${locale}/culture` },
    { name: 'Sport', href: `/${locale}/sport` },
    { name: 'Nous Soutenir', href: `/${locale}/nous-soutenir` },
  ];

  const dropdownItems = [
    { name: 'Médias', href: `/${locale}/medias` },
    { name: 'Communiqués', href: `/${locale}/communiques` },
    { name: 'Infos Pratiques', href: `/${locale}/infos-pratiques` },
    { name: 'Religion', href: `/${locale}/religion` },
    { name: 'Emploi', href: `/${locale}/emploi` },
    { name: 'Blog', href: `/${locale}/blog` },
    { name: 'À Propos', href: `/${locale}/a-propos` },
    { name: 'Contact', href: `/${locale}/contact` },
  ];

  const mobileMenuCategories = [
    {
      title: 'Actualités',
      icon: Newspaper,
      items: [
        { name: 'Toutes les actualités', href: `/${locale}/actualites` },
        { name: 'Politique', href: `/${locale}/actualites/politique` },
        { name: 'Économie', href: `/${locale}/actualites/economie` },
        { name: 'Société', href: `/${locale}/actualites/societe` },
        { name: 'Santé', href: `/${locale}/actualites/sante` },
        { name: 'Sécurité', href: `/${locale}/actualites/securite` },
      ],
    },
    {
      title: 'Médias',
      icon: Radio,
      items: [
        { name: 'Photos', href: `/${locale}/medias/photos` },
        { name: 'Vidéos', href: `/${locale}/medias/videos` },
        { name: 'Podcasts', href: `/${locale}/medias/podcasts` },
        { name: 'Live', href: `/${locale}/medias/live` },
      ],
    },
    {
      title: 'Religion',
      icon: ScrollText,
      items: [
        { name: 'Méditations', href: `/${locale}/religion/meditations` },
        { name: 'Homélies', href: `/${locale}/religion/homelies` },
        { name: 'Musiques sacrées', href: `/${locale}/religion/musiques-sacrees` },
        { name: 'Agenda religieux', href: `/${locale}/religion/agenda-religieux` },
        { name: 'Message du temps', href: `/${locale}/religion/message-du-temps` },
      ],
    },
    {
      title: 'Culture',
      icon: Palette,
      items: [
        { name: 'Musique', href: `/${locale}/culture/musique` },
        { name: 'Cinéma', href: `/${locale}/culture/cinema` },
        { name: 'Arts', href: `/${locale}/culture/arts` },
        { name: 'Tendances', href: `/${locale}/culture/tendances` },
      ],
    },
    {
      title: 'Sport',
      icon: Trophy,
      items: [
        { name: 'Football', href: `/${locale}/sport/football` },
        { name: 'Basketball', href: `/${locale}/sport/basket` },
        { name: 'Athlétisme', href: `/${locale}/sport/athletisme` },
        { name: 'Événements', href: `/${locale}/sport/evenements` },
      ],
    },
    {
      title: 'Science & Tech',
      icon: FlaskConical,
      items: [
        { name: 'Base de données', href: `/${locale}/science-tech/base-de-donnees` },
        { name: 'Analyse de données', href: `/${locale}/science-tech/analyse-de-donnees` },
        { name: 'Nature & Environnement', href: `/${locale}/science-tech/nature-environnement` },
      ],
    },
    {
      title: 'Emploi',
      icon: Briefcase,
      items: [
        { name: 'Offres par secteur', href: `/${locale}/emploi/offres/sante` },
        { name: 'Conseils carrière', href: `/${locale}/emploi/conseils-carriere` },
        { name: 'Bourses & Stages', href: `/${locale}/emploi/bourses-stages` },
      ],
    },
    {
      title: 'Infos Pratiques',
      icon: Info,
      items: [
        { name: 'Guides', href: `/${locale}/infos-pratiques/guides` },
        { name: 'Tutoriels', href: `/${locale}/infos-pratiques/tutoriels` },
        { name: 'Ressources', href: `/${locale}/infos-pratiques/ressources-educatives` },
      ],
    },
    {
      title: 'Communiqués',
      icon: Newspaper,
      items: [
        { name: 'Gouvernement', href: `/${locale}/communiques/gouvernement` },
        { name: 'Religieux', href: `/${locale}/communiques/religieux` },
        { name: 'ONG', href: `/${locale}/communiques/ong` },
        { name: 'Éducatif', href: `/${locale}/communiques/educatif` },
      ],
    },
    {
      title: 'Blog',
      icon: BookOpen,
      items: [
        { name: 'Tribunes', href: `/${locale}/blog/tribunes` },
        { name: 'Chroniques', href: `/${locale}/blog/chroniques` },
        { name: 'Enquêtes', href: `/${locale}/blog/enquetes` },
        { name: 'Sondages', href: `/${locale}/blog/sondages` },
      ],
    },
    {
      title: 'À Propos',
      icon: Info,
      items: [
        { name: 'Mission', href: `/${locale}/a-propos/mission` },
        { name: 'Équipe', href: `/${locale}/a-propos/equipe` },
        { name: 'Charte', href: `/${locale}/a-propos/charte` },
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
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Plus de services"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-sm">Services Malakin</h3>
                    <button
                      className="text-gray-400 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Link
                      href={`/${locale}/recherche`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Search className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-xs text-white text-center">Recherche</span>
                    </Link>
                    <Link
                      href={`/${locale}/communiques`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Newspaper className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="text-xs text-white text-center">Communiqués</span>
                    </Link>
                    <Link
                      href={`/${locale}/archives`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                        <ScrollText className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-xs text-white text-center">Archives</span>
                    </Link>
                    <Link
                      href={`/${locale}/radio-afrique`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Radio className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="text-xs text-white text-center">Radio Afrique</span>
                    </Link>
                    <Link
                      href={`/${locale}/science-tech`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                        <FlaskConical className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="text-xs text-white text-center">Science & Tech</span>
                    </Link>
                    <Link
                      href={`/${locale}/forum-afrique`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                        <BookOpen className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="text-xs text-white text-center">Forum Afrique</span>
                    </Link>
                    <Link
                      href={`/${locale}/partenariats`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-6 h-6 text-pink-400" />
                      </div>
                      <span className="text-xs text-white text-center">Partenariats</span>
                    </Link>
                    <Link
                      href={`/${locale}/infos-pratiques`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Info className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-xs text-white text-center">Infos Pratiques</span>
                    </Link>
                    <Link
                      href={`/${locale}/medias`}
                      className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                        <Radio className="w-6 h-6 text-orange-400" />
                      </div>
                      <span className="text-xs text-white text-center">Médias</span>
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
            <div className="relative">
              <button
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                title="Applications"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              
              {isAppsMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-border rounded-lg shadow-lg p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Link
                      href="/admin"
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs text-center">Admin</span>
                    </Link>
                    <Link
                      href={`/${locale}/medias`}
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-2">
                        <Radio className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-xs text-center">Médias</span>
                    </Link>
                    <Link
                      href={`/${locale}/blog`}
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-xs text-center">Blog</span>
                    </Link>
                    <Link
                      href={`/${locale}/emploi`}
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
                        <Briefcase className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-xs text-center">Emploi</span>
                    </Link>
                    <Link
                      href={`/${locale}/nous-soutenir`}
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-2">
                        <DollarSign className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-xs text-center">Soutenir</span>
                    </Link>
                    <Link
                      href={`/${locale}/contact`}
                      className="flex flex-col items-center p-3 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsAppsMenuOpen(false)}
                    >
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-xs text-center">Contact</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/compte/connexion"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Connexion</span>
            </Link>
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
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Newspaper className="w-5 h-5" />
              Accueil
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
                <span className="text-sm font-medium">Connexion</span>
              </Link>
            </div>

            {isDropdownOpen && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-sm">Services Malakin</h3>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Link
                    href={`/${locale}/recherche`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Search className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs text-white text-center">Recherche</span>
                  </Link>
                  <Link
                    href={`/${locale}/communiques`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Newspaper className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs text-white text-center">Communiqués</span>
                  </Link>
                  <Link
                    href={`/${locale}/archives`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                      <ScrollText className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs text-white text-center">Archives</span>
                  </Link>
                  <Link
                    href={`/${locale}/radio-afrique`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Radio className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-xs text-white text-center">Radio Afrique</span>
                  </Link>
                  <Link
                    href={`/${locale}/science-tech`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
                      <FlaskConical className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-xs text-white text-center">Science & Tech</span>
                  </Link>
                  <Link
                    href={`/${locale}/forum-afrique`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                      <BookOpen className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs text-white text-center">Forum Afrique</span>
                  </Link>
                  <Link
                    href={`/${locale}/partenariats`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Briefcase className="w-6 h-6 text-pink-400" />
                    </div>
                    <span className="text-xs text-white text-center">Partenariats</span>
                  </Link>
                  <Link
                    href={`/${locale}/infos-pratiques`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-xs text-white text-center">Infos Pratiques</span>
                  </Link>
                  <Link
                    href={`/${locale}/medias`}
                    className="flex flex-col items-center p-3 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                      <Radio className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="text-xs text-white text-center">Médias</span>
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
