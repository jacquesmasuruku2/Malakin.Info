'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/i18n';
import { pickCopy } from '@/lib/copy';
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from '@/lib/site-legal';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
      <defs>
        <linearGradient id="igGradientContact" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="25%" stopColor="#FF7A00" />
          <stop offset="50%" stopColor="#FF0069" />
          <stop offset="75%" stopColor="#D300C5" />
          <stop offset="100%" stopColor="#7638FA" />
        </linearGradient>
      </defs>
      <path
        fill="url(#igGradientContact)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

type SocialLink = {
  label: string;
  href: string;
  color?: string;
  className?: string;
  icon: ReactNode;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61593119312402',
    color: '#1877F2',
    icon: <FacebookIcon />,
  },
  {
    label: 'X',
    href: 'https://x.com/Malakinfo1',
    className: 'text-[#0F1419] dark:text-white',
    icon: <XIcon />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/malakinfo/',
    icon: <InstagramIcon />,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/243998258441',
    color: '#25D366',
    icon: <WhatsAppIcon />,
  },
];

export default function ContactPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const copy = {
    headline: pickCopy(locale, {
      fr: 'Écrivez-nous',
      en: 'Write to us',
      es: 'Escríbenos',
      sw: 'Tuandikie',
      ln: 'Kokoma biso',
      rw: 'Dwandikire',
    }),
    lead: pickCopy(locale, {
      fr: 'Une question, une précision, une idée de reportage : la rédaction vous lit.',
      en: 'A question, a clarification, a story idea — the newsroom is listening.',
      es: 'Una pregunta, una precisión, una idea de reportaje: la redacción te lee.',
      sw: 'Swali, ufafanuzi, au wazo la ripoti — wahariri wanasikiliza.',
      ln: 'Motuna, clarité, idée ya reportage : rédaction ezali koyoka yo.',
      rw: 'Ikibazo, ubusobanuro, cyangwa igitekerezo cy’inkuru — abanyamakuru barakumva.',
    }),
    cta: pickCopy(locale, {
      fr: 'Envoyer un message',
      en: 'Send a message',
      es: 'Enviar un mensaje',
      sw: 'Tuma ujumbe',
      ln: 'Tinda message',
      rw: 'Ohereza ubutumwa',
    }),
    name: pickCopy(locale, {
      fr: 'Nom',
      en: 'Name',
      es: 'Nombre',
      sw: 'Jina',
      ln: 'Nkombo',
      rw: 'Izina',
    }),
    email: 'Email',
    subject: pickCopy(locale, {
      fr: 'Sujet',
      en: 'Subject',
      es: 'Asunto',
      sw: 'Mada',
      ln: 'Sujet',
      rw: 'Ingingo',
    }),
    message: 'Message',
    send: pickCopy(locale, {
      fr: 'Envoyer',
      en: 'Send',
      es: 'Enviar',
      sw: 'Tuma',
      ln: 'Tinda',
      rw: 'Ohereza',
    }),
    sending: pickCopy(locale, {
      fr: 'Envoi…',
      en: 'Sending…',
      es: 'Enviando…',
      sw: 'Inatuma…',
      ln: 'Kozala kotinda…',
      rw: 'Birimo koherezwa…',
    }),
    success: pickCopy(locale, {
      fr: 'Message bien reçu. Nous vous répondons dès que possible.',
      en: 'Message received. We will reply as soon as we can.',
      es: 'Mensaje recibido. Te responderemos lo antes posible.',
      sw: 'Ujumbe umepokelewa. Tutajibu haraka iwezekanavyo.',
      ln: 'Message ezwami. Tokoyanola yo noki.',
      rw: 'Ubutumwa bwakiriwe. Tuzagusubiza vuba bishoboka.',
    }),
    errorFallback: pickCopy(locale, {
      fr: "Une erreur est survenue lors de l'envoi.",
      en: 'Something went wrong while sending.',
      es: 'Ocurrió un error al enviar.',
      sw: 'Hitilafu imetokea wakati wa kutuma.',
      ln: 'Erreur ezali na ntango ya kotinda.',
      rw: 'Habaye ikosa mu kohereza.',
    }),
    reach: pickCopy(locale, {
      fr: 'Autrement',
      en: 'Other ways',
      es: 'Otras vías',
      sw: 'Njia zingine',
      ln: 'Ndenge mosusu',
      rw: 'Ubundi buryo',
    }),
    hours: pickCopy(locale, {
      fr: 'Lun–Ven, 8h–18h',
      en: 'Mon–Fri, 8am–6pm',
      es: 'Lun–Vie, 8h–18h',
      sw: 'Jumatatu–Ijumaa, 8–18',
      ln: 'Lundi–Vendredi, 8h–18h',
      rw: 'Kuwa–Kuwa, 8h–18h',
    }),
    follow: pickCopy(locale, {
      fr: 'Sur les réseaux',
      en: 'On social',
      es: 'En redes',
      sw: 'Mitandaoni',
      ln: 'Na ba réseaux',
      rw: 'Ku mbuga nkoranyambaga',
    }),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        setErrorMessage(error.error || copy.errorFallback);
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(copy.errorFallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fieldClass =
    'w-full border-0 border-b border-border bg-transparent px-0 py-3 text-foreground placeholder:text-muted-foreground/70 transition-[border-color] focus:border-primary focus:outline-none focus:ring-0';

  const phoneHref = `tel:${SITE_PHONE.replace(/\s/g, '')}`;

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#081c3d] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(212,175,55,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(11,59,139,0.55), transparent 50%), linear-gradient(160deg, #061428 0%, #0b3b8b 48%, #081c3d 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-12deg, transparent, transparent 18px, rgba(255,255,255,0.35) 18px, rgba(255,255,255,0.35) 19px)',
          }}
        />

        <div className="relative mx-auto flex min-h-[min(58vh,420px)] max-w-3xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white motion-safe:animate-[fadeInUp_0.55s_ease_both] sm:text-5xl md:text-6xl">
            {copy.headline}
          </h1>
          <p
            className="mt-4 max-w-md text-base leading-relaxed text-white/80 motion-safe:animate-[fadeInUp_0.55s_ease_both] sm:text-lg"
            style={{ animationDelay: '80ms' }}
          >
            {copy.lead}
          </p>
          <a
            href="#message"
            className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#d4af37] pb-1 text-sm font-semibold tracking-wide text-[#d4af37] transition-colors hover:text-white hover:border-white motion-safe:animate-[fadeInUp_0.55s_ease_both]"
            style={{ animationDelay: '160ms' }}
          >
            {copy.cta}
          </a>
        </div>
      </section>

      <section id="message" className="scroll-mt-24 bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 motion-safe:animate-[fadeInUp_0.6s_ease_both]"
          >
            {submitStatus === 'success' && (
              <div className="flex items-start gap-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{copy.success}</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {copy.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={fieldClass}
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {copy.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldClass}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {copy.subject}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {copy.message}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`${fieldClass} resize-none`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:bg-primary/90 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              {isSubmitting ? copy.sending : copy.send}
            </button>
          </form>

          <div
            className="mt-16 border-t border-border pt-10 motion-safe:animate-[fadeInUp_0.65s_ease_both]"
            style={{ animationDelay: '120ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {copy.reach}
            </p>
            <ul className="mt-5 space-y-3 text-[15px] text-foreground">
              <li>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {SITE_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={phoneHref}
                  className="underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {SITE_PHONE}
                </a>
                <span className="ml-2 text-sm text-muted-foreground">{copy.hours}</span>
              </li>
              <li className="text-muted-foreground">{SITE_ADDRESS}</li>
            </ul>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {copy.follow}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted/80 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-muted dark:bg-white/10 dark:hover:bg-white/15 ${link.className || ''}`}
                  style={link.color ? { color: link.color } : undefined}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
