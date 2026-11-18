'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/i18n';
import { pickCopy } from '@/lib/copy';
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from '@/lib/site-legal';
import RecaptchaWidget from '@/components/RecaptchaWidget';

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
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61593119312402', color: '#1877F2', icon: <FacebookIcon /> },
  { label: 'X', href: 'https://x.com/Malakinfo1', className: 'text-[#0F1419] dark:text-white', icon: <XIcon /> },
  { label: 'Instagram', href: 'https://www.instagram.com/malakinfo/', icon: <InstagramIcon /> },
  { label: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb8COtvFsn0n2moPVg3m', color: '#25D366', icon: <WhatsAppIcon /> },
];

export default function ContactPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [recaptchaResetKey, setRecaptchaResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const copy = {
    headline: pickCopy(locale, { fr: 'Contactez-nous', en: 'Contact us', es: 'Contáctanos', sw: 'Wasiliana nasi', ln: 'Solola na biso', rw: 'Twandikire' }),
    lead: pickCopy(locale, { fr: 'Nous ne pouvons pas vous aider si vous ne nous dites pas ce qui se passe !', en: "We can't help if you don't tell us what's going on!", es: 'No podemos ayudarte si no nos cuentas qué ocurre.', sw: 'Hatuwezi kukusaidia usipotuambia kinachoendelea.', ln: 'Tokoki kosalisa yo te soki oyebisi biso te likambo nini ezali.', rw: 'Ntidushobora kugufasha utatubwiye ikibazo ufite.' }),
    name: pickCopy(locale, { fr: 'Nom', en: 'Name', es: 'Nombre', sw: 'Jina', ln: 'Nkombo', rw: 'Izina' }),
    email: 'Email',
    message: pickCopy(locale, { fr: 'Message', en: 'Message', es: 'Mensaje', sw: 'Ujumbe', ln: 'Message', rw: 'Ubutumwa' }),
    send: pickCopy(locale, { fr: 'Envoyer', en: 'Send', es: 'Enviar', sw: 'Tuma', ln: 'Tinda', rw: 'Ohereza' }),
    sending: pickCopy(locale, { fr: 'Envoi…', en: 'Sending…', es: 'Enviando…', sw: 'Inatuma…', ln: 'Kozala kotinda…', rw: 'Birimo koherezwa…' }),
    success: pickCopy(locale, { fr: 'Message bien reçu. Nous vous répondons dès que possible.', en: 'Message received. We will reply as soon as we can.', es: 'Mensaje recibido. Te responderemos lo antes posible.', sw: 'Ujumbe umepokelewa. Tutajibu haraka iwezekanavyo.', ln: 'Message ezwami. Tokoyanola yo noki.', rw: 'Ubutumwa bwakiriwe. Tuzagusubiza vuba bishoboka.' }),
    errorFallback: pickCopy(locale, { fr: "Une erreur est survenue lors de l'envoi.", en: 'Something went wrong while sending.', es: 'Ocurrió un error al enviar.', sw: 'Hitilafu imetokea wakati wa kutuma.', ln: 'Erreur ezali na ntango ya kotinda.', rw: 'Habaye ikosa mu kohereza.' }),
    captchaRequired: pickCopy(locale, { fr: 'Veuillez confirmer que vous n’êtes pas un robot.', en: 'Please confirm that you are not a robot.', es: 'Confirma que no eres un robot.', sw: 'Thibitisha kuwa wewe si roboti.', ln: 'Kondima ete ozali robot te.', rw: 'Emeza ko utari robot.' }),
    captchaUnavailable: pickCopy(locale, { fr: 'La vérification anti-robot n’est pas configurée. Veuillez réessayer plus tard.', en: 'Bot protection is not configured. Please try again later.', es: 'La protección anti-bots no está configurada. Inténtalo más tarde.', sw: 'Ulinzi wa roboti haujawekwa. Jaribu tena baadaye.', ln: 'Protection ya ba robot ebongisami te. Meká lisusu na nsima.', rw: 'Kurinda robots ntibirashyirwaho. Ongera ugerageze nyuma.' }),
    reach: pickCopy(locale, { fr: 'Autrement', en: 'Other ways', es: 'Otras vías', sw: 'Njia zingine', ln: 'Ndenge mosusu', rw: 'Ubundi buryo' }),
    follow: pickCopy(locale, { fr: 'Sur les réseaux', en: 'On social', es: 'En redes', sw: 'Mitandaoni', ln: 'Na ba réseaux', rw: 'Ku mbuga nkoranyambaga' }),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setCaptchaError(copy.captchaRequired);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setCaptchaError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: captchaToken }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        resetRecaptcha();
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        setErrorMessage(error.error?.includes('not configured') ? copy.captchaUnavailable : error.error || copy.errorFallback);
        resetRecaptcha();
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(copy.errorFallback);
      resetRecaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetRecaptcha = () => {
    setCaptchaToken(null);
    setRecaptchaResetKey((current) => current + 1);
    setCaptchaError('');
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setCaptchaError('');
  };

  const fieldClass =
    'w-full rounded-none border border-[#d7d7d7] bg-[#f5f5f5] px-3 py-3 text-sm text-[#222] placeholder:text-[#7b7b7b] transition-colors focus:border-[#b82424] focus:outline-none focus:ring-2 focus:ring-[#b82424]/20';

  const phoneHref = `tel:${SITE_PHONE.replace(/\s/g, '')}`;

  return (
    <div className="min-h-screen bg-[#303030] text-white">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-white/75">MalakInfo</p>
          <h1 className="font-heading text-3xl font-bold uppercase">{copy.headline}</h1>
          <p className="mt-2 text-sm font-semibold text-white/90">{copy.lead}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
          <div>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {submitStatus === 'success' && (
                <div className="flex items-start gap-3 border border-emerald-400/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{copy.success}</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-start gap-3 border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="sr-only">{copy.name}</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={fieldClass} placeholder={copy.name} autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">{copy.email}</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} placeholder={copy.email} autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">{copy.message}</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} className={`${fieldClass} resize-y`} placeholder={copy.message} required />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !captchaToken || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  className="inline-flex items-center rounded-sm bg-[#c62828] px-5 py-2.5 text-xs font-bold uppercase text-white transition-colors hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? copy.sending : copy.send}
                </button>
              </div>

              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                <div className="block w-fit border border-[#1e1e1e] bg-[#262626] p-2">
                  <RecaptchaWidget
                    siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    resetKey={recaptchaResetKey}
                    onChange={handleCaptchaChange}
                  />
                </div>
              ) : (
                <div role="status" className="max-w-sm border border-amber-300/40 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
                  {copy.captchaUnavailable}
                </div>
              )}
              {captchaError && <p role="alert" className="text-sm text-red-300">{captchaError}</p>}
            </form>
          </div>

          <aside className="pt-1">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-white/80">{copy.reach}</h2>

            <div className="space-y-3 text-sm font-semibold">
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-start gap-3 text-white transition-colors hover:text-white/70">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-all">{SITE_EMAIL}</span>
              </a>

              <a href={phoneHref} className="flex items-start gap-3 text-white transition-colors hover:text-white/70">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{SITE_PHONE}</span>
              </a>

              <div className="flex items-start gap-3 text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{SITE_ADDRESS}</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/80">{copy.follow}</p>
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 ${link.className ?? ''}`}
                    style={link.color ? { color: link.color } : undefined}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
