import { Metadata } from 'next';
import Link from 'next/link';
import { PUBLICATION_DIRECTOR, SITE_ADDRESS, SITE_EMAIL, SITE_NAME, SITE_PHONE } from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'À propos - Malakinfo.com',
  description: 'MalakInfo est un média d’information indépendant basé à Kinshasa, consacré à l’Afrique et au monde.',
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          {isFrench ? `À propos de ${SITE_NAME}` : `About ${SITE_NAME}`}
        </h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            {SITE_NAME} est un média d’information indépendant, édité à Kinshasa, en République démocratique du Congo. Nous publions des actualités, des analyses et des dossiers sur l’Afrique et le monde, avec une attention particulière à la RDC et à sa diaspora.
          </p>
          <p>
            Notre ligne est celle d’un journalisme de service public : vérifier, contextualiser et expliquer. Le site est conçu pour les lecteurs, pas pour dupliquer des dépêches sans valeur ajoutée.
          </p>

          <h2 className="font-heading text-2xl font-bold text-foreground">Qui nous sommes</h2>
          <p>
            {SITE_NAME} est édité par {PUBLICATION_DIRECTOR} et porté par une rédaction de journalistes, de contributeurs et d’une équipe technique basée à Kinshasa. Les auteurs sont identifiés sur les articles et sur la page équipe.
          </p>

          <h2 className="font-heading text-2xl font-bold text-foreground">Ce que nous publions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Actualités politiques, économiques, diplomatiques et sportives</li>
            <li>Dossiers de société, santé, culture et science</li>
            <li>Contenus multimédias : photos, vidéos, lives et radio</li>
            <li>Offres d’emploi et informations pratiques</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-foreground">Où nous trouver</h2>
          <p>{SITE_ADDRESS}</p>
          <p>Email : {SITE_EMAIL}</p>
          <p>Téléphone : {SITE_PHONE}</p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href={`/${locale}/equipe`} className="text-primary hover:underline font-medium">
              {isFrench ? 'Rencontrer l’équipe' : 'Meet the team'}
            </Link>
            <Link href={`/${locale}/mission`} className="text-primary hover:underline font-medium">
              {isFrench ? 'Notre mission' : 'Our mission'}
            </Link>
            <Link href={`/${locale}/charte`} className="text-primary hover:underline font-medium">
              {isFrench ? 'Charte éthique' : 'Editorial charter'}
            </Link>
            <Link href={`/${locale}/contact`} className="text-primary hover:underline font-medium">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
