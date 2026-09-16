'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Send,
} from 'lucide-react';

interface JobOffer {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  location: string | null;
  type: string;
  salary: string | null;
  publishedAt: Date | string;
  deadline: Date | string | null;
  featured: boolean;
  details?: any;
  imageUrl?: string | null;
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function ContentBlock({
  title,
  content,
  html = false,
}: {
  title: string;
  content: string;
  html?: boolean;
}) {
  if (!content?.trim()) return null;

  return (
    <section className="border-t border-[#081c3d]/10 pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-heading text-2xl font-bold text-[#081c3d] sm:text-3xl">{title}</h2>
      {html || looksLikeHtml(content) ? (
        <div
          className="prose prose-slate mt-5 max-w-none prose-headings:font-heading prose-headings:text-[#081c3d] prose-a:text-[#0b3b8b] prose-strong:text-[#081c3d]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">{content}</div>
      )}
    </section>
  );
}

export default function JobOfferDetail({
  locale,
  jobOffer,
}: {
  locale: string;
  jobOffer: JobOffer;
}) {
  const isFrench = locale === 'fr';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeUrl: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isExpired = Boolean(jobOffer.deadline && new Date(jobOffer.deadline) < new Date());
  const details = jobOffer.details || {};
  const dateLocale = isFrench ? 'fr-FR' : 'en-US';

  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOfferId: jobOffer.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSuccess(true);
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        coverLetter: '',
        resumeUrl: '',
      });
    } catch {
      setError(
        isFrench
          ? 'Erreur lors de la soumission de la candidature.'
          : 'Something went wrong while submitting your application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const detailSections = [
    { key: 'missions', title: isFrench ? 'Missions principales' : 'Key missions', content: details.missions },
    { key: 'profile', title: isFrench ? 'Profil recherché' : 'Desired profile', content: details.profile },
    { key: 'qualities', title: isFrench ? 'Qualités recherchées' : 'Desired qualities', content: details.qualities },
    { key: 'editorialLine', title: isFrench ? 'Ligne éditoriale' : 'Editorial line', content: details.editorialLine },
    {
      key: 'collaborationConditions',
      title: isFrench ? 'Conditions de collaboration' : 'Collaboration terms',
      content: details.collaborationConditions,
    },
    {
      key: 'applicationDocuments',
      title: isFrench ? 'Dossier de candidature' : 'Application materials',
      content: details.applicationDocuments,
    },
    {
      key: 'selectionProcess',
      title: isFrench ? 'Processus de sélection' : 'Selection process',
      content: details.selectionProcess,
    },
  ] as const;

  const fieldClass =
    'w-full border-0 border-b border-[#081c3d]/20 bg-transparent px-0 py-3 text-[#081c3d] outline-none transition placeholder:text-slate-400 focus:border-[#d4af37]';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <section className="relative isolate min-h-[52vh] overflow-hidden bg-[#081c3d] text-white sm:min-h-[58vh]">
        {jobOffer.imageUrl ? (
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={{ backgroundImage: `url(${jobOffer.imageUrl})` }}
            aria-hidden
          />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.22),transparent_40%),linear-gradient(145deg,#0b3b8b,#081c3d_55%,#061229)]"
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,61,0.55)_0%,rgba(8,28,61,0.72)_45%,rgba(8,28,61,0.94)_100%)]"
          aria-hidden
        />
        <div
          className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[#d4af37]/20 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[52vh] max-w-5xl flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[58vh] sm:px-6 sm:pb-16 lg:px-8">
          <Link
            href={`/${locale}/emploi`}
            className="mb-8 inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isFrench ? 'Retour aux offres' : 'Back to openings'}
          </Link>

          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            MalakInfo Emploi
          </p>
          <h1 className="max-w-4xl font-heading text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {jobOffer.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100/90">
            {jobOffer.type ? (
              <span className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#d4af37]" />
                {jobOffer.type}
              </span>
            ) : null}
            {jobOffer.location ? (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d4af37]" />
                {jobOffer.location}
              </span>
            ) : null}
            {jobOffer.salary ? (
              <span className="inline-flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#d4af37]" />
                {jobOffer.salary}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {isExpired && jobOffer.deadline ? (
          <p className="mb-10 border-l-2 border-[#e63946] pl-4 text-sm font-medium text-[#e63946]">
            {isFrench
              ? `Cette offre a expiré le ${formatDate(jobOffer.deadline)}.`
              : `This opening expired on ${formatDate(jobOffer.deadline)}.`}
          </p>
        ) : null}

        <div className="space-y-10">
          <ContentBlock
            title={isFrench ? 'Description du poste' : 'Role description'}
            content={jobOffer.description}
          />

          {jobOffer.requirements ? (
            <ContentBlock
              title={isFrench ? 'Exigences' : 'Requirements'}
              content={jobOffer.requirements}
            />
          ) : null}

          {detailSections.map((section) =>
            section.content ? (
              <ContentBlock
                key={section.key}
                title={section.title}
                content={section.content}
                html
              />
            ) : null
          )}
        </div>

        <dl className="mt-12 grid gap-6 border-t border-[#081c3d]/10 pt-8 text-sm sm:grid-cols-2">
          {jobOffer.publishedAt ? (
            <div>
              <dt className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                {isFrench ? 'Publication' : 'Published'}
              </dt>
              <dd className="mt-1 font-medium text-[#081c3d]">{formatDate(jobOffer.publishedAt)}</dd>
            </div>
          ) : null}
          {jobOffer.deadline ? (
            <div>
              <dt className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                {isFrench ? 'Date limite' : 'Deadline'}
              </dt>
              <dd className={`mt-1 font-medium ${isExpired ? 'text-[#e63946]' : 'text-[#081c3d]'}`}>
                {formatDate(jobOffer.deadline)}
              </dd>
            </div>
          ) : null}
        </dl>

        {!isExpired ? (
          <section id="postuler" className="mt-16 border-t border-[#081c3d]/15 pt-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0b3b8b]">
              {isFrench ? 'Candidature' : 'Application'}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-[#081c3d]">
              {isFrench ? 'Postuler à cette offre' : 'Apply for this role'}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              {isFrench
                ? 'Remplissez le formulaire pour soumettre votre candidature.'
                : 'Open the form to submit your application.'}
            </p>

            {success ? (
              <p className="mt-8 border-l-2 border-[#d4af37] pl-4 text-sm font-medium text-[#081c3d]">
                {isFrench
                  ? 'Votre candidature a été envoyée. Merci pour votre intérêt.'
                  : 'Your application has been sent. Thank you for your interest.'}
              </p>
            ) : !showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex items-center gap-2 bg-[#0b3b8b] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#081c3d]"
              >
                <Send className="h-4 w-4" />
                {isFrench ? 'Remplir le formulaire' : 'Open application form'}
              </button>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-8 motion-safe:animate-[fadeInUp_0.4s_ease_both]"
              >
                {error ? (
                  <p className="border-l-2 border-[#e63946] pl-4 text-sm font-medium text-[#e63946]">{error}</p>
                ) : null}

                <div className="grid gap-8 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {isFrench ? 'Nom complet *' : 'Full name *'}
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Email *
                    </span>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={fieldClass}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {isFrench ? 'Téléphone' : 'Phone'}
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {isFrench ? 'Lettre de motivation' : 'Cover letter'}
                  </span>
                  <textarea
                    rows={5}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className={`${fieldClass} resize-none`}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {isFrench ? 'Lien vers votre CV (URL)' : 'Resume link (URL)'}
                  </span>
                  <input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="https://"
                    className={fieldClass}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-[#0b3b8b] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#081c3d] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {submitting
                      ? isFrench
                        ? 'Envoi…'
                        : 'Sending…'
                      : isFrench
                        ? 'Envoyer ma candidature'
                        : 'Submit application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError('');
                    }}
                    className="px-2 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-[#081c3d]"
                  >
                    {isFrench ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
