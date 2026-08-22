import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { Calendar, MapPin, Briefcase, DollarSign, ArrowLeft, Send } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function JobOfferPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;

  const jobOffer = await withRetry(() => prisma.jobOffer.findUnique({
    where: { slug },
  }));

  if (!jobOffer) {
    notFound();
  }

  const isExpired = jobOffer.deadline && new Date(jobOffer.deadline) < new Date();

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
              Envoyez votre CV et une lettre de motivation à l'adresse indiquée ci-dessous.
            </p>
            <Link
              href={`mailto:contact@malakinfo.com?subject=Candidature: ${encodeURIComponent(jobOffer.title)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Send className="w-5 h-5" />
              Envoyer ma candidature
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
