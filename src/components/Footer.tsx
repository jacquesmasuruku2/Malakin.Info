'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ChevronRight, ArrowUp, Sparkles, Award, Users, Radio, TrendingUp, Newspaper, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';

const chipClass =
  'relative overflow-hidden rounded-lg border border-white/15 px-3 py-2.5 text-center text-xs text-white/90 transition-colors hover:border-white/30 hover:bg-white/10';
const linkClass =
  'group flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white';
const headingClass =
  'mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const t = messages.footer;
  const nav = messages.nav;

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

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      setNewsletterStatus({ type: 'error', text: locale === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.' });
      return;
    }

    setIsNewsletterSubmitting(true);
    setNewsletterStatus(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent: true,
          interests: ['actualites', 'economie', 'culture', 'sport', 'tech'],
          name: newsletterName.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de l’inscription.');
      }

      setNewsletterStatus({
        type: 'success',
        text: locale === 'fr' ? 'Merci, vous êtes inscrit à la newsletter.' : 'Thank you, you are subscribed to the newsletter.',
      });
      setNewsletterName('');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus({
        type: 'error',
        text: error instanceof Error ? error.message : (locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'),
      });
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const socialIcons = {
    Website: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      color: '#FFFFFF',
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
          <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: '#FFFFFF',
      url: 'https://x.com/Malakinfo1',
    },
    Instagram: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="igGradientFooter" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD600"/>
              <stop offset="25%" stopColor="#FF7A00"/>
              <stop offset="50%" stopColor="#FF0069"/>
              <stop offset="75%" stopColor="#D300C5"/>
              <stop offset="100%" stopColor="#7638FA"/>
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
  };

  return (
    <footer className="relative bg-[#081c3d] text-white">
      <div className="h-px bg-[#d4af37]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-28 right-4 z-[60] rounded-full bg-[#0b3b8b] p-3 text-white shadow-lg transition hover:bg-[#0a3276] sm:bottom-8 sm:right-8"
            aria-label={locale === 'fr' ? 'Remonter en haut' : 'Back to top'}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-8">
            <div>
              <h3 className={headingClass}>
                <Newspaper className="w-4 h-4 text-[#d4af37]" />
                {t.inTheNews}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href={`/${locale}/politique`}
                    className={chipClass}
                    onMouseEnter={() => setHoveredItem('politics')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.politics}</span>
                  </Link>
                  <Link
                    href={`/${locale}/economie`}
                    className={chipClass}
                    onMouseEnter={() => setHoveredItem('economy')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.economy}</span>
                  </Link>
                </div>
                <Link
                  href={`/${locale}/actualites`}
                  className={chipClass}
                  onMouseEnter={() => setHoveredItem('allNews')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    {t.africanNews2026}
                  </span>
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href={`/${locale}/societe`}
                    className={chipClass}
                    onMouseEnter={() => setHoveredItem('society')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.society}</span>
                  </Link>
                  <Link
                    href={`/${locale}/sante`}
                    className={chipClass}
                    onMouseEnter={() => setHoveredItem('health')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="relative z-10">{nav.health}</span>
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className={headingClass}>
                <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                {t.sections}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[nav.security, nav.environment, nav.culture].map((item, index) => (
                  <Link
                    key={item}
                    href={`/${locale}/${['securite', 'environnement', 'culture'][index]}`}
                    className={linkClass}
                  >
                    <ChevronRight className="w-3 h-3 text-[#d4af37] opacity-0 transition-opacity group-hover:opacity-100" />
                    {item}
                  </Link>
                ))}
                {[nav.sport, nav.employment, nav.religion].map((item, index) => (
                  <Link
                    key={item}
                    href={`/${locale}/${['sport', 'emploi', 'religion'][index]}`}
                    className={linkClass}
                  >
                    <ChevronRight className="w-3 h-3 text-[#d4af37] opacity-0 transition-opacity group-hover:opacity-100" />
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>
              <Users className="w-4 h-4 text-[#d4af37]" />
              {t.aboutMalakin}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[t.whoAreWe, t.ourMission, t.ourTeam].map((item, index) => (
                <Link
                  key={item}
                  href={`/${locale}/${['a-propos', 'mission', 'equipe'][index]}`}
                  className={linkClass}
                >
                  <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
                  {item}
                </Link>
              ))}
              {[nav.contact, t.advertising, nav.supportUs].map((item, index) => (
                <Link
                  key={item}
                  href={`/${locale}/${['contact', 'partenariats', 'nous-soutenir'][index]}`}
                  className={linkClass}
                >
                  <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
                  {item}
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-[#e63946]" />
                <span className="text-xs text-white/75">Soutenez l'information indépendante</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>
              <Radio className="w-4 h-4 text-[#d4af37]" />
              {t.malakinMediaNetwork}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[t.malakinRadioAfrica, t.focusEco, t.youthTribune].map((item, index) => (
                <Link
                  key={item}
                  href={`/${locale}/${['diffusion-en-direct', 'medias', 'medias/live'][index]}`}
                  className={linkClass}
                >
                  <span className="text-[#d4af37]">●</span>
                  {item}
                </Link>
              ))}
              {[t.malakinDocu, t.mediaObservatory, t.partnerships].map((item, index) => (
                <Link
                  key={item}
                  href={`/${locale}/${['medias/photos', 'nous-soutenir', 'partenariats'][index]}`}
                  className={linkClass}
                >
                  <span className="text-[#d4af37]">◆</span>
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>
              <Award className="w-4 h-4 text-[#d4af37]" />
              {t.services}
            </h3>
            <div className="space-y-2">
              <Link href="/rss.xml" className={linkClass}>
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                {t.rssFeeds}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">Newsletter</p>
              <h4 className="mt-2 font-heading text-2xl font-bold text-white">
                {locale === 'fr' ? 'Restez informé' : 'Stay informed'}
              </h4>
              <p className="mt-2 text-sm text-white/70">
                {locale === 'fr'
                  ? 'Abonnez-vous pour recevoir les dernières actualités directement dans votre boîte mail.'
                  : 'Subscribe to receive the latest news directly in your inbox.'}
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full max-w-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newsletterName}
                  onChange={(event) => setNewsletterName(event.target.value)}
                  placeholder={locale === 'fr' ? 'Votre nom (optionnel)' : 'Your name (optional)'}
                  className="w-full max-w-[220px] rounded-lg border border-white/15 bg-[#081c3d] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none"
                  aria-label="Name newsletter"
                />
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder={locale === 'fr' ? 'Entrez votre adresse email' : 'Enter your email address'}
                  className="flex-1 rounded-lg border border-white/15 bg-[#081c3d] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none"
                  aria-label="Email newsletter"
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className="rounded-lg bg-[#0b3b8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3276] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isNewsletterSubmitting ? (locale === 'fr' ? 'Envoi...' : 'Sending...') : (locale === 'fr' ? 'S\'abonner' : 'Subscribe')}
                </button>
              </div>
              {newsletterStatus && (
                <p className={`mt-3 text-sm ${newsletterStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {newsletterStatus.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
          {[
            t.legalNotices,
            t.privacyPolicy,
            t.termsOfUse,
            t.cookies
          ].map((item, index) => (
            <Link
              key={item}
              href={`/${locale}/${['mentions-legales', 'politique-confidentialite', 'conditions-utilisation', 'cookies'][index]}`}
              className="transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-sm text-white/70">
          {Object.entries(socialIcons).map(([name, { icon: Icon, color, url }]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              onMouseEnter={() => setHoveredItem(name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ color }}>
                <Icon />
              </span>
              {name}
              <span className={`text-[8px] text-[#d4af37] ${hoveredItem === name ? 'opacity-100' : 'opacity-0'}`}>●</span>
            </a>
          ))}

          <div className="flex flex-wrap items-center gap-4 sm:ml-2 sm:border-l sm:border-white/15 sm:pl-4">
            <a href="mailto:contact@malakinfo.com" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <Mail className="w-4 h-4 text-[#d4af37]" />
              <span>{t.contactEmail}</span>
            </a>
            <a href="tel:+243998258441" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <Phone className="w-4 h-4 text-[#d4af37]" />
              <span>+243 998 258 441</span>
            </a>
            <div className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>{t.location}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/50">
          <p className="flex flex-wrap items-center justify-end gap-2">
            <span>© {currentYear} MalakInfo.com</span>
            <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
            <span>{t.copyright}</span>
            <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
            <span>{t.madeWith}</span>
            <Heart className="w-3 h-3 text-[#e63946] inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
