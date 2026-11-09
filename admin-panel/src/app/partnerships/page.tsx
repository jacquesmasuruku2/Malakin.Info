'use client';

import { useEffect, useState } from 'react';
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
  imageUrl: string;
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
  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/partnerships?status=approved', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible de charger les partenaires.');
      setPartners(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les partenaires.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetch('/api/partnerships?status=approved', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Impossible de charger les partenaires.');
        if (!cancelled) setPartners(Array.isArray(data) ? data : []);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les partenaires.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'La publication du partenaire a échoué.');

      setForm(emptyForm);
      setPartners((current) => [data, ...current]);
      setNotice('Le partenaire est publié dans le footer.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'La publication du partenaire a échoué.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async (partner: FooterPartner) => {
    setRemovingId(partner.id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/partnerships/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
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

          <section className="card rounded-lg border p-5 shadow-sm sm:p-6" style={{ borderColor: 'var(--card-border)' }}>
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-bg)] text-primary">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary">Publier un partenaire</h2>
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
                  {isSaving ? 'Publication…' : 'Publier dans le footer'}
                </button>
              </div>
            </form>
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
                    <img src={partner.imageUrl} alt={`Logo ${partner.companyName}`} className="h-14 w-24 shrink-0 rounded border border-[var(--card-border)] bg-white p-1.5 object-contain" />
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
