import { Metadata } from 'next';
import Link from 'next/link';
import {
  HOSTING_PROVIDER,
  LEGAL_UPDATED_AT,
  PUBLICATION_DIRECTOR,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Mentions légales - Malakinfo.com',
  description: 'Mentions légales du site Malakinfo.com',
};

export default async function LegalNoticesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Mentions légales
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Éditeur du site</h2>
            <p className="text-muted-foreground">
              <strong>{SITE_NAME}</strong>
            </p>
            <p className="text-muted-foreground">
              Média d’information indépendant consacré à l’Afrique et au monde, édité par {PUBLICATION_DIRECTOR}.
            </p>
            <p className="text-muted-foreground">Adresse : {SITE_ADDRESS}</p>
            <p className="text-muted-foreground">Email : {SITE_EMAIL}</p>
            <p className="text-muted-foreground">Téléphone : {SITE_PHONE}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Responsable de publication</h2>
            <p className="text-muted-foreground">
              <strong>{PUBLICATION_DIRECTOR}</strong>
            </p>
            <p className="text-muted-foreground">
              Directeur de la publication
            </p>
            <p className="text-muted-foreground">
              Contact éditorial : {SITE_EMAIL}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Hébergeur</h2>
            <p className="text-muted-foreground">
              <strong>{HOSTING_PROVIDER.name}</strong>
            </p>
            <p className="text-muted-foreground">{HOSTING_PROVIDER.address}</p>
            <p className="text-muted-foreground">Téléphone : {HOSTING_PROVIDER.phone}</p>
            <p className="text-muted-foreground">
              Site : <a href={HOSTING_PROVIDER.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{HOSTING_PROVIDER.website}</a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              Les contenus originaux publiés sur ce site (textes, images, vidéos, sons, graphismes, logos) sont protégés. Toute reproduction non autorisée est interdite, sauf accord préalable de {SITE_NAME} ou usage légitime expressément prévu par la loi.
            </p>
            <p className="text-muted-foreground">
              Les marques et contenus de tiers restent la propriété de leurs titulaires.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Contenus provenant de tiers</h2>
            <p className="text-muted-foreground">
              Certains articles peuvent citer ou relayer des informations d’agences, d’institutions ou de partenaires. Ces contenus sont utilisés dans un cadre journalistique, avec mention de la source lorsque cela s’applique.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Signalement</h2>
            <p className="text-muted-foreground">
              Pour signaler une erreur, un contenu illicite ou une atteinte à un droit, écrivez à {SITE_EMAIL} en indiquant l’URL concernée.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Fonctionnalités du site</h2>
            <p className="text-muted-foreground">
              Outre la consultation des articles, {SITE_NAME} propose notamment :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Des alertes sur le site et, avec votre accord, des notifications du navigateur pour signaler les nouvelles publications</li>
              <li>Un espace compte permettant de gérer votre profil</li>
              <li>Une rubrique emploi avec offres, candidatures et échanges avec le recruteur</li>
              <li>Des services multimédias (radio, contenus culturels et autres rubriques éditoriales)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              L’usage de ces fonctionnalités est détaillé dans les{' '}
              <Link href={`/${locale}/conditions-utilisation`} className="text-primary hover:underline">conditions d’utilisation</Link>
              {' '}et la{' '}
              <Link href={`/${locale}/politique-confidentialite`} className="text-primary hover:underline">politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Données personnelles et cookies</h2>
            <p className="text-muted-foreground">
              Tant que vous n’avez pas personnalisé vos choix, les cookies non essentiels (audience, publicité, personnalisation) sont acceptés par défaut. Pour les modifier : cliquez sur le bouton cookie en bas à gauche de n’importe quelle page, choisissez Refuser ou Accepter pour chaque catégorie (ou Refuser tout / Accepter tout), puis cliquez sur Enregistrer.
            </p>
            <p className="text-muted-foreground mt-4">
              Le site peut également utiliser des notifications (interface et/ou navigateur) pour vous informer des nouvelles publications, uniquement avec votre permission lorsque le navigateur le demande. Le traitement des données et la procédure complète sont décrits dans la{' '}
              <Link href={`/${locale}/politique-confidentialite`} className="text-primary hover:underline">politique de confidentialité</Link>
              {' '}et la{' '}
              <Link href={`/${locale}/cookies`} className="text-primary hover:underline">politique de cookies</Link>.
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Date de dernière mise à jour : {LEGAL_UPDATED_AT}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
