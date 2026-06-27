'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, User, ChevronDown, ChevronRight, Newspaper, DollarSign, FlaskConical, Palette, Trophy, Radio, ScrollText, Briefcase, BookOpen, Info, Mail } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
    { name: 'Accueil', href: '/' },
    { name: 'Actualités', href: '/actualites' },
    { name: 'Économie', href: '/actualites/economie' },
    { name: 'Science & Tech', href: '/science-tech' },
    { name: 'Culture', href: '/culture' },
    { name: 'Sport', href: '/sport' },
    { name: 'Nous Soutenir', href: '/nous-soutenir' },
  ];

  const dropdownItems = [
    { name: 'Médias', href: '/medias' },
    { name: 'Communiqués', href: '/communiques' },
    { name: 'Infos Pratiques', href: '/infos-pratiques' },
    { name: 'Religion', href: '/religion' },
    { name: 'Emploi', href: '/emploi' },
    { name: 'Blog', href: '/blog' },
    { name: 'À Propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
  ];

  const mobileMenuCategories = [
    {
      title: 'Actualités',
      icon: Newspaper,
      items: [
        { name: 'Toutes les actualités', href: '/actualites' },
        { name: 'Politique', href: '/actualites/politique' },
        { name: 'Économie', href: '/actualites/economie' },
        { name: 'Société', href: '/actualites/societe' },
        { name: 'Santé', href: '/actualites/sante' },
        { name: 'Sécurité', href: '/actualites/securite' },
      ],
    },
    {
      title: 'Médias',
      icon: Radio,
      items: [
        { name: 'Photos', href: '/medias/photos' },
        { name: 'Vidéos', href: '/medias/videos' },
        { name: 'Podcasts', href: '/medias/podcasts' },
        { name: 'Live', href: '/medias/live' },
      ],
    },
    {
      title: 'Religion',
      icon: ScrollText,
      items: [
        { name: 'Méditations', href: '/religion/meditations' },
        { name: 'Homélies', href: '/religion/homelies' },
        { name: 'Musiques sacrées', href: '/religion/musiques-sacrees' },
        { name: 'Agenda religieux', href: '/religion/agenda-religieux' },
        { name: 'Message du temps', href: '/religion/message-du-temps' },
      ],
    },
    {
      title: 'Culture',
      icon: Palette,
      items: [
        { name: 'Musique', href: '/culture/musique' },
        { name: 'Cinéma', href: '/culture/cinema' },
        { name: 'Arts', href: '/culture/arts' },
        { name: 'Tendances', href: '/culture/tendances' },
      ],
    },
    {
      title: 'Sport',
      icon: Trophy,
      items: [
        { name: 'Football', href: '/sport/football' },
        { name: 'Basketball', href: '/sport/basket' },
        { name: 'Athlétisme', href: '/sport/athletisme' },
        { name: 'Événements', href: '/sport/evenements' },
      ],
    },
    {
      title: 'Science & Tech',
      icon: FlaskConical,
      items: [
        { name: 'Base de données', href: '/science-tech/base-de-donnees' },
        { name: 'Analyse de données', href: '/science-tech/analyse-de-donnees' },
        { name: 'Nature & Environnement', href: '/science-tech/nature-environnement' },
      ],
    },
    {
      title: 'Emploi',
      icon: Briefcase,
      items: [
        { name: 'Offres par secteur', href: '/emploi/offres/sante' },
        { name: 'Conseils carrière', href: '/emploi/conseils-carriere' },
        { name: 'Bourses & Stages', href: '/emploi/bourses-stages' },
      ],
    },
    {
      title: 'Infos Pratiques',
      icon: Info,
      items: [
        { name: 'Guides', href: '/infos-pratiques/guides' },
        { name: 'Tutoriels', href: '/infos-pratiques/tutoriels' },
        { name: 'Ressources', href: '/infos-pratiques/ressources-educatives' },
      ],
    },
    {
      title: 'Communiqués',
      icon: Newspaper,
      items: [
        { name: 'Gouvernement', href: '/communiques/gouvernement' },
        { name: 'Religieux', href: '/communiques/religieux' },
        { name: 'ONG', href: '/communiques/ong' },
        { name: 'Éducatif', href: '/communiques/educatif' },
      ],
    },
    {
      title: 'Blog',
      icon: BookOpen,
      items: [
        { name: 'Tribunes', href: '/blog/tribunes' },
        { name: 'Chroniques', href: '/blog/chroniques' },
        { name: 'Enquêtes', href: '/blog/enquetes' },
        { name: 'Sondages', href: '/blog/sondages' },
      ],
    },
    {
      title: 'À Propos',
      icon: Info,
      items: [
        { name: 'Mission', href: '/a-propos/mission' },
        { name: 'Équipe', href: '/a-propos/equipe' },
        { name: 'Charte', href: '/a-propos/charte' },
      ],
    },
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
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
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Plus
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg py-2">
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
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
              <Link
                href="/compte/connexion"
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Connexion</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
