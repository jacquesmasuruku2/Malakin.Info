'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ExternalLink,
  MapPin,
  MessageSquareText,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { authFetch } from '@/lib/client-auth';
import { useAccountUser } from '@/lib/use-account-user';
import { pickCopy } from '@/lib/copy';

type ChatMessage = {
  id: string;
  senderType: string;
  senderName?: string | null;
  body: string;
  createdAt: string | Date;
};

type JobApplicationItem = {
  id: string;
  status: string;
  phone?: string | null;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  adminMessage?: string | null;
  respondedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages?: ChatMessage[];
  _count?: { messages?: number };
  jobOffer?: {
    id: string;
    title: string;
    slug: string;
    type?: string | null;
    location?: string | null;
    salary?: string | null;
    imageUrl?: string | null;
    deadline?: string | Date | null;
  } | null;
};

const STATUS_META: Record<string, { fr: string; en: string; tone: string }> = {
  pending: { fr: 'En attente', en: 'Pending', tone: 'bg-[#d4af37]/15 text-[#8a6d12]' },
  reviewing: { fr: 'En examen', en: 'Under review', tone: 'bg-[#0b3b8b]/10 text-[#0b3b8b]' },
  interview: { fr: 'Entretien', en: 'Interview', tone: 'bg-[#081c3d]/10 text-[#081c3d]' },
  accepted: { fr: 'Acceptée', en: 'Accepted', tone: 'bg-emerald-100 text-emerald-800' },
  rejected: { fr: 'Refusée', en: 'Declined', tone: 'bg-red-100 text-red-700' },
  withdrawn: { fr: 'Retirée', en: 'Withdrawn', tone: 'bg-slate-200 text-slate-600' },
};

function formatDate(value: string | Date | null | undefined, locale: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value: string | Date | null | undefined, locale: string) {
  if (!value) return '';
  return new Date(value).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AccountApplicationsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const isFrench = locale === 'fr';
  const { user, ready } = useAccountUser();

  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [editData, setEditData] = useState({
    phone: '',
    coverLetter: '',
    resumeUrl: '',
  });

  const selected = useMemo(
    () => applications.find((item) => item.id === selectedId) || null,
    [applications, selectedId]
  );

  const canEdit = selected && !['accepted', 'rejected', 'withdrawn'].includes(selected.status);
  const canChat = selected && selected.status !== 'withdrawn';

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch('/api/user/job-applications');
      if (response.status === 401) {
        window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}`;
        return;
      }
      if (!response.ok) throw new Error('load_failed');
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setApplications(list);
      setSelectedId((current) => current || list[0]?.id || null);
    } catch {
      setError(
        isFrench
          ? 'Impossible de charger vos candidatures.'
          : 'Unable to load your applications.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (applicationId: string) => {
    try {
      const response = await authFetch(`/api/user/job-applications/${applicationId}/messages`);
      if (!response.ok) return;
      const data = await response.json();
      setThread(Array.isArray(data) ? data : []);
      setApplications((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? { ...item, _count: { ...(item._count || {}), messages: 0 } }
            : item
        )
      );
    } catch {
      // keep previous thread
    }
  };

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      window.location.href = `/${locale}/compte/connexion?redirect=${encodeURIComponent(pathname)}`;
      return;
    }
    void loadApplications();
  }, [ready, user, locale, pathname]);

  useEffect(() => {
    if (!selected) return;
    setEditData({
      phone: selected.phone || '',
      coverLetter: selected.coverLetter || '',
      resumeUrl: selected.resumeUrl || '',
    });
    setReply('');
    setMessage('');
    setError('');
    void loadThread(selected.id);
  }, [selected?.id]);

  const handleSave = async () => {
    if (!selected || !canEdit) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await authFetch(`/api/user/job-applications/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'save_failed');
      }
      const updated = await response.json();
      setApplications((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setMessage(isFrench ? 'Candidature mise à jour.' : 'Application updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : isFrench ? 'Échec de la mise à jour.' : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selected || !canEdit) return;
    if (!confirm(isFrench ? 'Retirer cette candidature ?' : 'Withdraw this application?')) return;
    setSaving(true);
    setError('');
    try {
      const response = await authFetch(`/api/user/job-applications/${selected.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'withdraw_failed');
      }
      const updated = await response.json();
      setApplications((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setMessage(isFrench ? 'Candidature retirée.' : 'Application withdrawn.');
    } catch (err) {
      setError(err instanceof Error ? err.message : isFrench ? 'Échec du retrait.' : 'Withdraw failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !canChat || !reply.trim()) return;
    setSending(true);
    setError('');
    try {
      const response = await authFetch(`/api/user/job-applications/${selected.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'send_failed');
      }
      const created = await response.json();
      setThread((prev) => [...prev, created]);
      setReply('');
      setMessage(isFrench ? 'Message envoyé aux recruteurs.' : 'Message sent to recruiters.');
    } catch (err) {
      setError(err instanceof Error ? err.message : isFrench ? 'Échec de l’envoi.' : 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  const statusLabel = (status: string) => {
    const meta = STATUS_META[status] || { fr: status, en: status, tone: 'bg-slate-100 text-slate-700' };
    return isFrench ? meta.fr : meta.en;
  };

  const statusTone = (status: string) =>
    (STATUS_META[status] || { tone: 'bg-slate-100 text-slate-700' }).tone;

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] text-slate-500">
        {isFrench ? 'Chargement…' : 'Loading…'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <section className="relative overflow-hidden bg-[#081c3d] text-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.22),transparent_40%),linear-gradient(135deg,#0b3b8b,#081c3d_55%,#061229)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            href={`/${locale}/compte/profil`}
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isFrench ? 'Retour au profil' : 'Back to profile'}
          </Link>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            MalakInfo Compte
          </p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            {isFrench ? 'Mes candidatures' : 'My applications'}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/90">
            {isFrench
              ? 'Suivez vos offres et échangez directement avec les recruteurs depuis votre compte connecté.'
              : 'Track your applications and chat directly with recruiters from your signed-in account.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/emploi`}
              className="inline-flex items-center gap-2 border border-[#d4af37]/70 bg-[#d4af37] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#081c3d] transition hover:bg-white"
            >
              <Briefcase className="h-4 w-4" />
              {isFrench ? 'Voir les offres' : 'Browse openings'}
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error && !selected ? (
          <p className="mb-6 border-l-2 border-[#e63946] pl-4 text-sm font-medium text-[#e63946]">{error}</p>
        ) : null}

        {applications.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white/70 px-6 py-20 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-[#d4af37]" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-[#081c3d]">
              {isFrench ? 'Aucune candidature pour le moment' : 'No applications yet'}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              {isFrench
                ? 'Quand vous postulerez, la conversation avec les recruteurs apparaîtra ici dans votre compte.'
                : 'When you apply, your conversation with recruiters will appear here in your account.'}
            </p>
            <Link
              href={`/${locale}/emploi`}
              className="mt-8 inline-flex items-center gap-2 bg-[#0b3b8b] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#081c3d]"
            >
              <Send className="h-4 w-4" />
              {isFrench ? 'Découvrir les offres' : 'Discover openings'}
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b3b8b]">
                {applications.length}{' '}
                {isFrench
                  ? `candidature${applications.length > 1 ? 's' : ''}`
                  : `application${applications.length > 1 ? 's' : ''}`}
              </p>
              {applications.map((item) => {
                const active = item.id === selectedId;
                const unread = item._count?.messages || 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full border px-4 py-4 text-left transition ${
                      active
                        ? 'border-[#d4af37] bg-white shadow-sm'
                        : 'border-transparent bg-white/60 hover:border-[#081c3d]/15 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                      {unread > 0 ? (
                        <span className="bg-[#e63946] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 font-heading text-lg font-bold leading-snug text-[#081c3d]">
                      {item.jobOffer?.title || (isFrench ? 'Offre' : 'Opening')}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(item.createdAt, locale)}
                      {item.messages?.[0] || item.adminMessage
                        ? ` · ${isFrench ? 'Échanges actifs' : 'Active thread'}`
                        : ''}
                    </p>
                  </button>
                );
              })}
            </aside>

            {selected ? (
              <section className="bg-white px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#081c3d]/10 pb-6">
                  <div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(selected.status)}`}>
                      {statusLabel(selected.status)}
                    </span>
                    <h2 className="mt-3 font-heading text-3xl font-bold text-[#081c3d]">
                      {selected.jobOffer?.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      {selected.jobOffer?.type ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          {selected.jobOffer.type}
                        </span>
                      ) : null}
                      {selected.jobOffer?.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {selected.jobOffer.location}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selected.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                  {selected.jobOffer?.slug ? (
                    <Link
                      href={`/${locale}/emploi/${selected.jobOffer.slug}`}
                      className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b3b8b] hover:text-[#b88f18]"
                    >
                      {isFrench ? 'Voir l’offre' : 'View opening'}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>

                <div className="mt-8">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b3b8b]">
                    <MessageSquareText className="h-4 w-4" />
                    {isFrench ? 'Conversation avec le recrutement' : 'Conversation with hiring'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {isFrench
                      ? 'Les réponses et échanges se font uniquement ici, dans votre compte connecté.'
                      : 'Responses and exchanges happen only here, in your signed-in account.'}
                  </p>

                  <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto border border-[#081c3d]/10 bg-[#f8f9fb] p-4">
                    {thread.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        {isFrench
                          ? 'Aucun message pour l’instant. Dès qu’un recruteur vous répond, le fil s’affiche ici.'
                          : 'No messages yet. As soon as a recruiter replies, the thread appears here.'}
                      </p>
                    ) : (
                      thread.map((item) => {
                        const fromRecruiter = item.senderType === 'recruiter';
                        return (
                          <div
                            key={item.id}
                            className={`max-w-[90%] px-4 py-3 ${
                              fromRecruiter
                                ? 'mr-auto border-l-2 border-[#d4af37] bg-white'
                                : 'ml-auto bg-[#0b3b8b] text-white'
                            }`}
                          >
                            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${fromRecruiter ? 'text-[#8a6d12]' : 'text-blue-100'}`}>
                              {fromRecruiter
                                ? item.senderName || 'MalakInfo Recrutement'
                                : isFrench
                                  ? 'Vous'
                                  : 'You'}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.body}</p>
                            <p className={`mt-2 text-[11px] ${fromRecruiter ? 'text-slate-400' : 'text-blue-100/80'}`}>
                              {formatDateTime(item.createdAt, locale)}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {canChat ? (
                    <form onSubmit={handleSendReply} className="mt-4 space-y-3">
                      <textarea
                        rows={3}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={
                          isFrench
                            ? 'Écrire aux recruteurs…'
                            : 'Write to the recruiters…'
                        }
                        className="w-full resize-none border-0 border-b border-[#081c3d]/20 bg-transparent px-0 py-3 text-[#081c3d] outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="submit"
                        disabled={sending || !reply.trim()}
                        className="inline-flex items-center gap-2 bg-[#0b3b8b] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#081c3d] disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        {sending
                          ? isFrench
                            ? 'Envoi…'
                            : 'Sending…'
                          : isFrench
                            ? 'Envoyer le message'
                            : 'Send message'}
                      </button>
                    </form>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      {isFrench
                        ? 'Cette candidature est retirée : la conversation est en lecture seule.'
                        : 'This application was withdrawn: the conversation is read-only.'}
                    </p>
                  )}
                </div>

                <div className="mt-10 space-y-6 border-t border-[#081c3d]/10 pt-8">
                  <h3 className="font-heading text-xl font-bold text-[#081c3d]">
                    {isFrench ? 'Votre dossier' : 'Your application file'}
                  </h3>

                  {message ? (
                    <p className="border-l-2 border-[#d4af37] pl-4 text-sm font-medium text-[#081c3d]">{message}</p>
                  ) : null}
                  {error ? (
                    <p className="border-l-2 border-[#e63946] pl-4 text-sm font-medium text-[#e63946]">{error}</p>
                  ) : null}

                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {isFrench ? 'Téléphone' : 'Phone'}
                    </span>
                    <input
                      type="tel"
                      disabled={!canEdit}
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="mt-1 w-full border-0 border-b border-[#081c3d]/20 bg-transparent px-0 py-3 text-[#081c3d] outline-none focus:border-[#d4af37] disabled:opacity-60"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {isFrench ? 'Lettre de motivation' : 'Cover letter'}
                    </span>
                    <textarea
                      rows={5}
                      disabled={!canEdit}
                      value={editData.coverLetter}
                      onChange={(e) => setEditData({ ...editData, coverLetter: e.target.value })}
                      className="mt-1 w-full resize-none border-0 border-b border-[#081c3d]/20 bg-transparent px-0 py-3 text-[#081c3d] outline-none focus:border-[#d4af37] disabled:opacity-60"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {isFrench ? 'Lien CV (URL)' : 'Resume link (URL)'}
                    </span>
                    <input
                      type="url"
                      disabled={!canEdit}
                      value={editData.resumeUrl}
                      onChange={(e) => setEditData({ ...editData, resumeUrl: e.target.value })}
                      className="mt-1 w-full border-0 border-b border-[#081c3d]/20 bg-transparent px-0 py-3 text-[#081c3d] outline-none focus:border-[#d4af37] disabled:opacity-60"
                    />
                  </label>

                  {canEdit ? (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-[#0b3b8b] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#081c3d] disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {saving
                          ? isFrench
                            ? 'Enregistrement…'
                            : 'Saving…'
                          : isFrench
                            ? 'Enregistrer'
                            : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleWithdraw}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-2 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 transition hover:text-red-800 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isFrench ? 'Retirer ma candidature' : 'Withdraw application'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {pickCopy(locale, {
                        fr: 'Cette candidature est clôturée et ne peut plus être modifiée.',
                        en: 'This application is closed and can no longer be edited.',
                        es: 'Esta candidatura está cerrada y ya no se puede editar.',
                        sw: 'Ombi hili limefungwa na haliwezi kubadilishwa tena.',
                        ln: 'Candidature oyo esili, ekoki kobongwana lisusu te.',
                        rw: 'Iyi candidature yarangiye ntishobora guhindurwa.',
                      })}
                    </p>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
