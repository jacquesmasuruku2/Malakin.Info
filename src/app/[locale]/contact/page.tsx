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
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.49 0-2.694 1.242-2.694 2.772v2.8h-3.055v3.47h3.055v8.391C9.68 23.343 6.37 22.588 4 19.62V12.073h3.078V8.6c0-2.145 1.697-3.89 3.794-3.89 1.099 0 2.096.445 2.8 1.17.705.726 1.185 1.766 1.185 2.92v2.733h3.078v3.47H17.1v8.431C19.469 23.64 24 19.458 24 12.073Z"
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
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5-3.25a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17 6.25Z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.65-2.064-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.199-.298.299-.497.099-.2.05-.375-.025-.524-.075-.149-.67-1.612-.918-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.197 0-.52.075-.79.375s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.49 1.694.627.713.227 1.36.195 1.872.119.572-.085 1.758-.719 2.006-1.413.248-.693.248-1.289.174-1.413-.074-.123-.27-.198-.567-.347Z"
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

              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                <div className="inline-block border border-[#1e1e1e] bg-[#262626] p-2">
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

              <button
                type="submit"
                disabled={isSubmitting || !captchaToken || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                className="inline-flex items-center rounded-sm bg-[#c62828] px-5 py-2.5 text-xs font-bold uppercase text-white transition-colors hover:bg-[#a91f1f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? copy.sending : copy.send}
              </button>
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
