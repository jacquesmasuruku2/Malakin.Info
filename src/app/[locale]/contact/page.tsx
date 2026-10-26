'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Send, CheckCircle, AlertCircle, Mail, Phone, MapPin, MessageSquareText } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/i18n';
import { pickCopy } from '@/lib/copy';
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from '@/lib/site-legal';

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

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const copy = {
    headline: pickCopy(locale, { fr: 'Écrivez-nous', en: 'Write to us', es: 'Escríbenos', sw: 'Tuandikie', ln: 'Kokoma biso', rw: 'Dwandikire' }),
    lead: pickCopy(locale, { fr: 'Une question, une précision, une idée de reportage : la rédaction vous lit.', en: 'A question, a clarification, a story idea — the newsroom is listening.', es: 'Una pregunta, una precisión, una idea de reportaje: la redacción te lee.', sw: 'Swali, ufafanuzi, au wazo la ripoti — wahariri wanasikiliza.', ln: 'Motuna, clarité, idée ya reportage : rédaction ezali koyoka yo.', rw: 'Ikibazo, ubusobanuro, cyangwa igitekerezo cy’inkuru — abanyamakuru barakumva.' }),
    cta: pickCopy(locale, { fr: 'Envoyer un message', en: 'Send a message', es: 'Enviar un mensaje', sw: 'Tuma ujumbe', ln: 'Tinda message', rw: 'Ohereza ubutumwa' }),
    name: pickCopy(locale, { fr: 'Nom', en: 'Name', es: 'Nombre', sw: 'Jina', ln: 'Nkombo', rw: 'Izina' }),
    email: 'Email',
    subject: pickCopy(locale, { fr: 'Sujet', en: 'Subject', es: 'Asunto', sw: 'Mada', ln: 'Sujet', rw: 'Ingingo' }),
    message: 'Message',
    send: pickCopy(locale, { fr: 'Envoyer', en: 'Send', es: 'Enviar', sw: 'Tuma', ln: 'Tinda', rw: 'Ohereza' }),
    sending: pickCopy(locale, { fr: 'Envoi…', en: 'Sending…', es: 'Enviando…', sw: 'Inatuma…', ln: 'Kozala kotinda…', rw: 'Birimo koherezwa…' }),
    success: pickCopy(locale, { fr: 'Message bien reçu. Nous vous répondons dès que possible.', en: 'Message received. We will reply as soon as we can.', es: 'Mensaje recibido. Te responderemos lo antes posible.', sw: 'Ujumbe umepokelewa. Tutajibu haraka iwezekanavyo.', ln: 'Message ezwami. Tokoyanola yo noki.', rw: 'Ubutumwa bwakiriwe. Tuzagusubiza vuba bishoboka.' }),
    errorFallback: pickCopy(locale, { fr: "Une erreur est survenue lors de l'envoi.", en: 'Something went wrong while sending.', es: 'Ocurrió un error al enviar.', sw: 'Hitilafu imetokea wakati wa kutuma.', ln: 'Erreur ezali na ntango ya kotinda.', rw: 'Habaye ikosa mu kohereza.' }),
    reach: pickCopy(locale, { fr: 'Autrement', en: 'Other ways', es: 'Otras vías', sw: 'Njia zingine', ln: 'Ndenge mosusu', rw: 'Ubundi buryo' }),
    hours: pickCopy(locale, { fr: 'Lun–Ven, 8h–18h', en: 'Mon–Fri, 8am–6pm', es: 'Lun–Vie, 8h–18h', sw: 'Jumatatu–Ijumaa, 8–18', ln: 'Lundi–Vendredi, 8h–18h', rw: 'Kuwa–Kuwa, 8h–18h' }),
    follow: pickCopy(locale, { fr: 'Sur les réseaux', en: 'On social', es: 'En redes', sw: 'Mitandaoni', ln: 'Na ba réseaux', rw: 'Ku mbuga nkoranyambaga' }),
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
    'w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10';

  const phoneHref = `tel:${SITE_PHONE.replace(/\s/g, '')}`;

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-foreground">
      <section className="border-b border-border bg-[#081c3d] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">MalakInfo</p>
            <h1 className="font-heading text-4xl font-black tracking-[-0.04em] sm:text-5xl">{copy.headline}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-blue-50/85">{copy.lead}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitStatus === 'success' && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{copy.success}</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-foreground">
                    {copy.name}
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={fieldClass} autoComplete="name" required />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                    {copy.email}
                  </label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} autoComplete="email" required />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-foreground">
                  {copy.subject}
                </label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className={fieldClass} />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-foreground">
                  {copy.message}
                </label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={6} className={`${fieldClass} resize-none`} required />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B3B8B] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#092d67] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? copy.sending : copy.send}
              </button>
            </form>
          </div>

          <aside className="rounded-2xl border border-border bg-[#081c3d] p-6 text-white shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37] text-[#081c3d]">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37]">MalakInfo</p>
                <h2 className="mt-1 text-xl font-bold">{copy.reach}</h2>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
                <Mail className="mt-0.5 h-4 w-4 text-[#d4af37]" />
                <span className="break-all text-white/90">{SITE_EMAIL}</span>
              </a>

              <a href={phoneHref} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
                <Phone className="mt-0.5 h-4 w-4 text-[#d4af37]" />
                <span className="text-white/90">{SITE_PHONE}</span>
              </a>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#d4af37]" />
                <span className="text-white/90">{SITE_ADDRESS}</span>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#d4af37]">{copy.follow}</p>
              <div className="flex flex-wrap items-center gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-[#d4af37] hover:text-[#d4af37] ${link.className ?? ''}`}
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
