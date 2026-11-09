'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Building2, ExternalLink, ImagePlus, LoaderCircle, Plus, Upload } from 'lucide-react';

type FooterPartner = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  type: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  status: string;
  createdAt: string;
};

type PartnerForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  type: string;
  description: string;
  websiteUrl: string;
  imageUrl: string;
};

const emptyForm: PartnerForm = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  type: 'Partenaire',
  description: '',
  websiteUrl: '',
  imageUrl: '',
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<FooterPartner[]>([]);
  const [requests, setRequests] = useState<FooterPartner[]>([]);
  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);

  const fetchPartnerships = useCallback(async (): Promise<FooterPartner[]> => {
    const response = await fetch('/api/partnerships', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Impossible de charger les partenaires.');
    return Array.isArray(data) ? data : [];
  }, []);

  const loadPartners = useCallback(async () => {
    try {
      const allPartnerships = await fetchPartnerships();
      setPartners(allPartnerships.filter((partnership) => partnership.status === 'approved'));
      setRequests(allPartnerships.filter((partnership) => partnership.status === 'pending'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les partenaires.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPartnerships]);

  useEffect(() => {
    let cancelled = false;

    fetchPartnerships()
      .then((allPartnerships) => {
        if (cancelled) return;
        setPartners(allPartnerships.filter((partnership) => partnership.status === 'approved'));
        setRequests(allPartnerships.filter((partnership) => partnership.status === 'pending'));
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les partenaires.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPartnerships]);

  const updateForm = (key: keyof PartnerForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
    setNotice('');
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    setNotice('');

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'Images_partners');
      const response = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string') {
        throw new Error(data?.error || 'Le téléversement du logo a échoué.');
      }
      updateForm('imageUrl', data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Le téléversement du logo a échoué.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(
        editingRequestId ? `/api/partnerships/${editingRequestId}` : '/api/partnerships',
        {
          method: editingRequestId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            editingRequestId
              ? { status: 'approved', imageUrl: form.imageUrl, websiteUrl: form.websiteUrl || null }
              : form,
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'La publication du partenaire a échoué.');

      setForm(emptyForm);
      setEditingRequestId(null);
      setPartners((current) => [data, ...current]);
      setRequests((current) => current.filter((request) => request.id !== data.id));
      setNotice(
        editingRequestId
          ? `${data.companyName} est publié dans le footer.`
          : 'Le partenaire est publié dans le footer.',
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'La publication du partenaire a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const prepareRequest = (request: FooterPartner) => {
    setEditingRequestId(request.id);
    setForm({
      companyName: request.companyName,
      contactName: request.contactName,
      email: request.email,
      phone: request.phone || '',
      type: request.type,
      description: request.description || '',
      websiteUrl: request.websiteUrl || '',
      imageUrl: request.imageUrl || '',
    });
    setError('');
    setNotice(`Demande de ${request.companyName} prête à être publiée après l’ajout de son logo.`);
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUnpublish = async (partner: FooterPartner) => {
    setRemovingId(partner.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/partnerships/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unpublished' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Le retrait du partenaire a échoué.');

      setPartners((current) => current.filter((item) => item.id !== partner.id));
      setNotice(`${partner.companyName} a été retiré du footer. La demande reste disponible dans les soumissions.`);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Le retrait du partenaire a échoué.');
    } finally {
      setRemovingId(null);
      void loadPartners();
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-7">
          <header className="flex flex-col gap-3 border-b border-[var(--card-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-secondary">Partenariats</p>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Partenaires du footer</h1>
              <p className="mt-1.5 text-sm text-secondary">Publiez les logos qui apparaissent dans l’espace partenaires du site.</p>
            </div>
            <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-lg border px-3 text-sm font-medium text-secondary sm:self-auto" style={{ borderColor: 'var(--card-border)' }}>
              <Building2 className="h-4 w-4" />
              {partners.length} publié{partners.length === 1 ? '' : 's'}
            </div>
          </header>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

          <section ref={formSectionRef} className="card scroll-mt-24 rounded-lg border p-5 shadow-sm sm:p-6" style={{ borderColor: 'var(--card-border)' }}>
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-bg)] text-primary">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  {editingRequestId ? 'Finaliser la demande' : 'Publier un partenaire'}
                </h2>
                <p className="mt-1 text-sm text-secondary">Le logo est requis pour l’affichage dans le footer.</p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>Nom de l’entreprise *</span>
                <input required value={form.companyName} onChange={(event) => updateForm('companyName', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>Contact *</span>
                <input required value={form.contactName} onChange={(event) => updateForm('contactName', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>E-mail *</span>
                <input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>Type de partenariat *</span>
                <select required value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  <option>Partenaire</option>
                  <option>Partenaire média</option>
                  <option>Partenaire institutionnel</option>
                  <option>Sponsor</option>
                  <option>Autre</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>Téléphone</span>
                <input type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary">
                <span>Site web</span>
                <input type="url" placeholder="https://exemple.com" value={form.websiteUrl} onChange={(event) => updateForm('websiteUrl', event.target.value)} className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-primary sm:col-span-2">
                <span>Description</span>
                <textarea rows={3} value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="w-full resize-y rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-primary outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </label>

              <div className="space-y-2 sm:col-span-2">
                <span className="block text-sm font-medium text-primary">Logo du partenaire *</span>
                <div className="flex flex-wrap items-center gap-4">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt={`Logo ${form.companyName || 'du partenaire'}`} className="h-16 w-40 rounded-md border border-[var(--card-border)] bg-white p-2 object-contain" />
                  ) : (
                    <span className="flex h-16 w-40 items-center justify-center rounded-md border border-dashed text-secondary" style={{ borderColor: 'var(--card-border)' }}>
                      <ImagePlus className="h-6 w-6" />
                    </span>
                  )}
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-primary transition hover:bg-[var(--primary-bg)]" style={{ borderColor: 'var(--card-border)' }}>
                    {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? 'Téléversement…' : form.imageUrl ? 'Remplacer le logo' : 'Choisir un logo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={isUploading} onChange={(event) => { void handleLogoUpload(event.target.files?.[0]); event.target.value = ''; }} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4 sm:col-span-2" style={{ borderColor: 'var(--card-border)' }}>
                <button type="submit" disabled={isSaving || isUploading || !form.imageUrl} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSaving ? 'Publication…' : editingRequestId ? 'Publier cette demande dans le footer' : 'Publier dans le footer'}
                </button>
              </div>
            </form>
          </section>

          <section aria-labelledby="partnership-requests-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 id="partnership-requests-heading" className="text-lg font-semibold text-primary">Demandes reçues</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {requests.length} en attente
                </span>
              </div>
              <button type="button" onClick={() => void loadPartners()} className="text-sm font-semibold text-secondary hover:text-primary">Actualiser</button>
            </div>
            {isLoading ? (
              <div className="card rounded-lg border p-6 text-sm text-secondary" style={{ borderColor: 'var(--card-border)' }}>Chargement des demandes…</div>
            ) : requests.length === 0 ? (
              <div className="card rounded-lg border p-6 text-sm text-secondary" style={{ borderColor: 'var(--card-border)' }}>Aucune demande en attente pour le moment.</div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {requests.map((request) => (
                  <article key={request.id} className="card min-w-0 rounded-lg border p-4 sm:p-5" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-primary">{request.companyName}</h3>
                        <p className="mt-0.5 text-sm text-secondary">{request.type} · {new Date(request.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => prepareRequest(request)}
                        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold text-primary transition hover:bg-[var(--primary-bg)]"
                        style={{ borderColor: 'var(--card-border)' }}
                      >
                        <Plus className="h-4 w-4" />
                        Préparer la publication
                      </button>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-secondary">Contact</dt>
                        <dd className="text-primary">{request.contactName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary">E-mail</dt>
                        <dd><a href={`mailto:${request.email}`} className="break-all text-primary underline-offset-2 hover:underline">{request.email}</a></dd>
                      </div>
                      {request.phone && (
                        <div>
                          <dt className="text-xs font-medium text-secondary">Téléphone</dt>
                          <dd><a href={`tel:${request.phone}`} className="text-primary hover:underline">{request.phone}</a></dd>
                        </div>
                      )}
                      {request.websiteUrl && (
                        <div>
                          <dt className="text-xs font-medium text-secondary">Site web</dt>
                          <dd><a href={request.websiteUrl} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">{request.websiteUrl}</a></dd>
                        </div>
                      )}
                    </dl>
                    {request.description && (
                      <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
                        <p className="mb-1 text-xs font-medium text-secondary">Message de la demande</p>
                        <p className="whitespace-pre-wrap break-words text-sm text-primary">{request.description}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="published-partners-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="published-partners-heading" className="text-lg font-semibold text-primary">Partenaires publiés</h2>
              <button type="button" onClick={() => void loadPartners()} className="text-sm font-semibold text-secondary hover:text-primary">Actualiser</button>
            </div>
            {isLoading ? (
              <div className="card rounded-lg border p-6 text-sm text-secondary" style={{ borderColor: 'var(--card-border)' }}>Chargement des partenaires…</div>
            ) : partners.length === 0 ? (
              <div className="card rounded-lg border p-6 text-sm text-secondary" style={{ borderColor: 'var(--card-border)' }}>Aucun partenaire publié pour le moment.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {partners.map((partner) => (
                  <article key={partner.id} className="card flex min-w-0 items-center gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--card-border)' }}>
                    {partner.imageUrl ? (
                      <img src={partner.imageUrl} alt={`Logo ${partner.companyName}`} className="h-14 w-24 shrink-0 rounded border border-[var(--card-border)] bg-white p-1.5 object-contain" />
                    ) : (
                      <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded border border-[var(--card-border)] text-xs text-secondary">Sans logo</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-primary">{partner.companyName}</h3>
                      <p className="truncate text-xs text-secondary">{partner.type}</p>
                      {partner.websiteUrl && <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-secondary hover:text-primary"><ExternalLink className="h-3 w-3" /> Site web</a>}
                    </div>
                    <button type="button" disabled={removingId === partner.id} onClick={() => void handleUnpublish(partner)} className="shrink-0 rounded-md border px-2.5 py-2 text-xs font-semibold text-secondary hover:border-amber-500 hover:text-amber-700 disabled:opacity-50" style={{ borderColor: 'var(--card-border)' }}>
                      {removingId === partner.id ? '…' : 'Retirer'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
