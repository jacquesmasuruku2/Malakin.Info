'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ArrowUp, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';
import { t as tCopy } from '@/lib/copy';
import { subscribeToNewsletter } from '@/lib/newsletter-client';
import type { FooterPartner } from '@/lib/footer-partners';

const headingClass = 'mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#d4af37]';
const textLinkClass = 'text-[15px] text-white/85 transition-colors hover:text-[#d4af37]';
const chipClass =
  'inline-flex items-center rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] text-white/90 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]';

export default function Footer({ partners = [] }: { partners?: FooterPartner[] }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const scrollTopHideTimer = useRef<number | undefined>(undefined);

  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const t = messages.footer;
  const nav = messages.nav;

  useEffect(() => {
    const hideAfterIdle = () => {
      window.clearTimeout(scrollTopHideTimer.current);
      scrollTopHideTimer.current = window.setTimeout(() => {
        setShowScrollTop(false);
      }, 3000);
    };

    const revealOnTouch = () => {
      if (window.scrollY <= 120) {
        setShowScrollTop(false);
        return;
      }
      setShowScrollTop(true);
      hideAfterIdle();
    };

    const onScroll = () => {
      if (window.scrollY <= 120) {
        setShowScrollTop(false);
        window.clearTimeout(scrollTopHideTimer.current);
      }
    };

    window.addEventListener('pointerdown', revealOnTouch, { passive: true });
    window.addEventListener('touchstart', revealOnTouch, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(scrollTopHideTimer.current);
      window.removeEventListener('pointerdown', revealOnTouch);
      window.removeEventListener('touchstart', revealOnTouch);
      window.removeEventListener('scroll', onScroll);
    };
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
      const result = await subscribeToNewsletter(email);

      if (result.status === 'already_subscribed') {
        setNewsletterStatus({
          type: 'error',
          text: tCopy(locale, 'newsletterAlreadySubscribed'),
        });
        return;
      }

      if (result.status === 'error') {
        setNewsletterStatus({
          type: 'error',
          text: result.message || tCopy(locale, 'newsletterError'),
        });
        return;
      }

      setNewsletterStatus({
        type: 'success',
        text: tCopy(locale, 'newsletterThanks'),
      });
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus({
        type: 'error',
        text: tCopy(locale, 'newsletterError'),
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

  const newsTopics = [
    { label: nav.politics, href: `/${locale}/politique` },
    { label: nav.economy, href: `/${locale}/economie` },
    { label: t.africanNews2026, href: `/${locale}/actualites` },
    { label: nav.society, href: `/${locale}/societe` },
    { label: nav.health, href: `/${locale}/sante` },
  ];

  const sectionLinks = [
    { label: nav.security, href: `/${locale}/securite` },
    { label: nav.environment, href: `/${locale}/environnement` },
    { label: nav.culture, href: `/${locale}/culture` },
    { label: nav.sport, href: `/${locale}/sport` },
    { label: nav.employment, href: `/${locale}/emploi` },
    { label: nav.religion, href: `/${locale}/religion` },
  ];

  const aboutLinks = [
    { label: t.whoAreWe, href: `/${locale}/a-propos` },
    { label: t.ourMission, href: `/${locale}/mission` },
    { label: t.ourTeam, href: `/${locale}/equipe` },
    { label: nav.contact, href: `/${locale}/contact` },
    { label: t.advertising, href: `/${locale}/partenariats` },
    { label: nav.supportUs, href: `/${locale}/nous-soutenir` },
  ];

  const networkLinks = [
    { label: t.malakinRadioAfrica, href: `/${locale}/diffusion-en-direct` },
    { label: t.focusEco, href: `/${locale}/medias` },
    { label: t.youthTribune, href: `/${locale}/medias/live` },
    { label: t.malakinDocu, href: `/${locale}/medias/photos` },
    { label: t.mediaObservatory, href: `/${locale}/nous-soutenir` },
    { label: t.partnerships, href: `/${locale}/partenariats` },
  ];

  const topRubriques = [
    { label: nav.politics, href: `/${locale}/politique` },
    { label: nav.economy, href: `/${locale}/economie` },
    { label: nav.culture, href: `/${locale}/culture` },
    { label: nav.sport, href: `/${locale}/sport` },
    { label: nav.scienceTech, href: `/${locale}/science-tech` },
    { label: nav.religion, href: `/${locale}/religion` },
  ];

  return (
    <footer className="bg-[#081c3d] text-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-28 right-4 z-[60] rounded-full bg-[#0b3b8b] p-3 text-white shadow-lg transition hover:bg-[#0a3276] sm:bottom-8 sm:right-8"
            aria-label={locale === 'fr' ? 'Remonter en haut' : 'Back to top'}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <nav className="flex flex-wrap gap-x-8 gap-y-3 border-b border-white/15 py-5 text-[13px] font-medium uppercase tracking-[0.08em] text-white/80">
          {topRubriques.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#d4af37]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className={headingClass}>{t.inTheNews}</h3>
            <div className="flex flex-wrap gap-2">
              {newsTopics.map((item) => (
                <Link key={item.href + item.label} href={item.href} className={chipClass}>
                  {item.label}
                </Link>
              ))}
            </div>
            <h3 className={`${headingClass} mt-8`}>{t.sections}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {sectionLinks.map((item) => (
                <Link key={item.href} href={item.href} className={textLinkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>{t.aboutMalakin}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {aboutLinks.map((item) => (
                <Link key={item.href + item.label} href={item.href} className={textLinkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>{t.malakinMediaNetwork}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {networkLinks.map((item) => (
                <Link key={item.href + item.label} href={item.href} className={textLinkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>{t.services}</h3>
            <div className="space-y-2.5">
              <Link href={`/${locale}/archives`} className={`${textLinkClass} block`}>
                {t.archives}
              </Link>
              <Link href="/rss.xml" className={`${textLinkClass} block`}>
                {t.rssFeeds}
              </Link>
            </div>
            <p className="mt-8 mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#d4af37]">
              Newsletter
            </p>
            <p className="mb-4 text-sm text-white/70">
              {locale === 'fr'
                ? 'Abonnez-vous pour recevoir les dernières actualités directement dans votre boîte mail.'
                : 'Subscribe to receive the latest news directly in your inbox.'}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder={locale === 'fr' ? 'Entrez votre adresse email' : 'Enter your email address'}
                className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none"
                aria-label="Email newsletter"
              />
              <button
                type="submit"
                disabled={isNewsletterSubmitting}
                className="w-full rounded-md bg-[#0b3b8b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3276] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isNewsletterSubmitting ? (locale === 'fr' ? 'Envoi...' : 'Sending...') : (locale === 'fr' ? 'S\'abonner' : 'Subscribe')}
              </button>
              {newsletterStatus && (
                <p className={`text-sm ${newsletterStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {newsletterStatus.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 py-5 text-sm text-white/70">
          {[
            t.legalNotices,
            t.privacyPolicy,
            t.termsOfUse,
            t.cookies,
          ].map((item, index) => (
            <Link
              key={item}
              href={`/${locale}/${['mentions-legales', 'politique-confidentialite', 'conditions-utilisation', 'cookies'][index]}`}
              className="hover:text-[#d4af37]"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/15 py-5 text-sm text-white/85">
          {Object.entries(socialIcons).map(([name, { icon: Icon, color, url }]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[#d4af37]"
            >
              <span style={{ color }}>
                <Icon />
              </span>
              {name}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-5 text-sm text-white/70">
          <a href="mailto:contact@malakinfo.com" className="inline-flex items-center gap-2 hover:text-[#d4af37]">
            <Mail className="w-4 h-4 text-[#d4af37]" />
            {t.contactEmail}
          </a>
          <a href="tel:+243998258441" className="inline-flex items-center gap-2 hover:text-[#d4af37]">
            <Phone className="w-4 h-4 text-[#d4af37]" />
            +243 998 258 441
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            {t.location}
          </span>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-white">MalakInfo</p>
            <p className="mt-1 text-xs text-white/50">
              {locale === 'fr'
                ? 'Médias & partenaires premium'
                : 'Media & premium partners'}
            </p>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-start gap-x-8 gap-y-4 sm:justify-center lg:px-8">
            {partners.length > 0 ? (
              partners.map((partner) => {
                const logo = (
                  <img
                    src={partner.imageUrl}
                    alt={partner.companyName}
                    title={partner.companyName}
                    className="h-8 w-auto max-w-[120px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-9"
                  />
                );

                return partner.websiteUrl ? (
                  <a
                    key={partner.id}
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center"
                    aria-label={partner.companyName}
                  >
                    {logo}
                  </a>
                ) : (
                  <span key={partner.id} className="inline-flex items-center">
                    {logo}
                  </span>
                );
              })
            ) : (
              <Link
                href={`/${locale}/partenariats`}
                className="text-xs uppercase tracking-[0.14em] text-white/45 transition hover:text-[#d4af37]"
              >
                {locale === 'fr' ? 'Espace partenaires' : 'Partner space'}
              </Link>
            )}
          </div>

          <p className="flex flex-wrap items-center gap-2 text-xs text-white/50 sm:justify-end">
            <span>© {currentYear} MalakInfo.com</span>
            <span>{t.copyright}</span>
            <span>{t.madeWith}</span>
            <Heart className="inline h-3 w-3 text-[#e63946]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
