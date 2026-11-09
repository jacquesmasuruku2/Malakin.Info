'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ArrowUp, Heart } from 'lucide-react';
import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { getLocaleFromPathname, getMessages } from '@/lib/i18n';
import type { FooterPartner } from '@/lib/footer-partners';

const headingClass = 'mb-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/95';
const textLinkClass = 'text-[15px] text-white/85 transition-colors hover:text-white';
const chipClass =
  'inline-flex items-center rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] text-white/90 transition-colors hover:border-white hover:text-white';

export default function Footer({ partners = [] }: { partners?: FooterPartner[] }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  const socialIcons = {
    Website: {
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" style={{ display: 'block' }}>
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      color: '#FFFFFF',
      url: 'https://malakinfo.com',
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
    '(Twitter)': {
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
      url: 'https://whatsapp.com/channel/0029Vb8COtvFsn0n2moPVg3m',
    },
  };

  const newsTopics = [
    { label: nav.politics, href: `/${locale}/politique` },
    { label: nav.economy, href: `/${locale}/economie` },
    { label: t.africanNews2026, href: `/${locale}/actualites` },
    { label: nav.society, href: `/${locale}/societe` },
    { label: nav.health, href: `/${locale}/sante` },
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
    { label: t.malakinDocu, href: `/${locale}/medias` },
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

  const renderPartnerLogo = (partner: FooterPartner, key: string, decorative = false) => {
    const logo = (
      <img
        src={partner.imageUrl}
        alt={decorative ? '' : partner.companyName}
        title={decorative ? undefined : partner.companyName}
        className="max-h-12 w-auto max-w-[180px] object-contain"
      />
    );
    const className =
      'footer-partners-item flex h-12 w-[180px] shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

    if (decorative || !partner.websiteUrl) {
      return (
        <span key={key} aria-hidden={decorative || undefined} className={className}>
          {logo}
        </span>
      );
    }

    return (
      <a
        key={key}
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={className}
        aria-label={partner.companyName}
      >
        {logo}
      </a>
    );
  };

  return (
    <footer className="bg-[#20578f] text-white pb-24 md:pb-0">
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

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-b border-white/15 py-5 text-center text-[13px] font-medium uppercase tracking-[0.08em] text-white/80 md:justify-start md:text-left">
          {topRubriques.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-10 py-12 text-left sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className={headingClass}>{t.inTheNews}</h3>
            <div className="flex flex-wrap justify-start gap-2">
              {newsTopics.map((item) => (
                <Link key={item.href + item.label} href={item.href} className={chipClass}>
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

          <div className="lg:flex lg:flex-col">
            <h3 className={headingClass}>{t.services}</h3>
            <div className="space-y-2.5">
              <Link href={`/${locale}/archives`} className={`${textLinkClass} block`}>
                {t.archives}
              </Link>
              <Link href="/rss.xml" className={`${textLinkClass} block`}>
                {t.rssFeeds}
              </Link>
            </div>
            <Link
              href={`/${locale}/newsletter`}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#20578f] transition hover:bg-white/90 lg:mt-auto lg:self-start"
            >
              Newsletter
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-white/20 py-5 text-sm text-white/90">
          {Object.entries(socialIcons).map(([name, { icon: Icon, color, url }]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <span style={{ color }}>
                <Icon />
              </span>
              {name}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-6 text-center text-sm text-white/85">
          <a href="mailto:contact@malakinfo.com" className="inline-flex items-center gap-2 hover:text-white">
            <Mail className="w-4 h-4 text-white/90" />
            {t.contactEmail}
          </a>
          <a href="tel:+243998258441" className="inline-flex items-center gap-2 hover:text-white">
            <Phone className="w-4 h-4 text-white/90" />
            +243 998 258 441
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/90" />
            {t.location}
          </span>
        </div>

        <section aria-labelledby="footer-partners-title" className="border-y border-white/25 py-6">
          <h2
            id="footer-partners-title"
            className="text-center text-[13px] font-semibold uppercase tracking-[0.08em] text-white/95"
          >
            {locale === 'fr' ? 'Nos partenaires' : 'Our partners'}
          </h2>
          {partners.length > 0 ? (
            partners.length > 6 ? (
              <div className="footer-partners-marquee mx-auto mt-6 max-w-6xl">
                <div
                  className="footer-partners-track"
                  style={{ '--footer-partners-duration': `${partners.length * 6}s` } as CSSProperties}
                >
                  <div className="footer-partners-group">
                    {partners.map((partner) => renderPartnerLogo(partner, partner.id))}
                  </div>
                  <div className="footer-partners-group" aria-hidden="true">
                    {partners.map((partner) =>
                      renderPartnerLogo(partner, `${partner.id}-duplicate`, true),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto mt-6 flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-8">
                {partners.map((partner) => renderPartnerLogo(partner, partner.id))}
              </div>
            )
          ) : (
            <div className="mt-4 text-center">
              <Link
                href={`/${locale}/partenariats`}
                className="text-xs uppercase tracking-[0.14em] text-white/75 transition hover:text-white"
              >
                {locale === 'fr' ? 'Espace partenaires' : 'Partner space'}
              </Link>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-end sm:justify-between">
          <nav aria-label={locale === 'fr' ? 'Informations légales' : 'Legal information'} className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-center text-sm text-white/90 md:justify-start md:text-left">
            {[
              t.legalNotices,
              t.privacyPolicy,
              t.termsOfUse,
              t.cookies,
            ].map((item, index) => (
              <Link
                key={item}
                href={`/${locale}/${['mentions-legales', 'politique-confidentialite', 'conditions-utilisation', 'cookies'][index]}`}
                className="hover:text-white"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-1 text-center text-xs text-white/75 md:items-end md:text-right">
            <p className="font-semibold tracking-wide text-white">MalakInfo</p>
            <p>
              {locale === 'fr'
                ? 'Aussi connu sous les noms Malaki et Malaki Info'
                : 'Also known as Malaki and Malaki Info'}
            </p>
            <p className="flex flex-wrap items-center gap-1 sm:justify-end">
              <span>© {currentYear} MalakInfo.com</span>
              <span>{t.copyright}</span>
              <span>{t.madeWith}</span>
              <Heart className="inline h-3 w-3 text-[#e63946]" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
