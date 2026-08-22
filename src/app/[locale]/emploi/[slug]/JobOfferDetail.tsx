'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, MapPin, Briefcase, DollarSign, ArrowLeft, Send, X } from 'lucide-react';

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
}

export default function JobOfferDetail({ 
  locale, 
  jobOffer 
}: { 
  locale: string;
  jobOffer: JobOffer;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isExpired = jobOffer.deadline && new Date(jobOffer.deadline) < new Date();
  const details = jobOffer.details || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (err) {
      setError('Erreur lors de la soumission de la candidature');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/emploi`}
            className="inline-flex items-center gap-2 text-gray-200 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux offres
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">{jobOffer.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-200">
            {jobOffer.type && (
              <span className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {jobOffer.type}
              </span>
            )}
            {jobOffer.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {jobOffer.location}
              </span>
            )}
            {jobOffer.salary && (
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {jobOffer.salary}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isExpired && jobOffer.deadline && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              ⚠️ Cette offre a expiré le {new Date(jobOffer.deadline).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Description du poste</h2>
          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
            {jobOffer.description}
          </div>
        </div>

        {jobOffer.requirements && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Exigences</h2>
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
              {jobOffer.requirements}
            </div>
          </div>
        )}

        {details.missions && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Missions principales</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.missions }} />
          </div>
        )}

        {details.profile && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Profil recherché</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.profile }} />
          </div>
        )}

        {details.qualities && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Qualités recherchées</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.qualities }} />
          </div>
        )}

        {details.editorialLine && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Ligne éditoriale</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.editorialLine }} />
          </div>
        )}

        {details.collaborationConditions && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Conditions de collaboration</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.collaborationConditions }} />
          </div>
        )}

        {details.applicationDocuments && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Dossier de candidature</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.applicationDocuments }} />
          </div>
        )}

        {details.selectionProcess && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Processus de sélection</h2>
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: details.selectionProcess }} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-6">Informations complémentaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobOffer.publishedAt && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date de publication</p>
                  <p className="font-medium text-gray-900">
                    {new Date(jobOffer.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
            {jobOffer.deadline && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date limite</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(jobOffer.deadline).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isExpired && (
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg shadow-sm p-8">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">Postuler à cette offre</h2>
            <p className="text-gray-200 mb-6">
              Remplissez le formulaire ci-dessous pour soumettre votre candidature.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Send className="w-5 h-5" />
              Remplir le formulaire
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Votre candidature a été soumise avec succès !
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-heading text-2xl font-bold text-[#081C3D]">Candidature: {jobOffer.title}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lettre de motivation
                  </label>
                  <textarea
                    rows={4}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien vers votre CV (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer ma candidature'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
