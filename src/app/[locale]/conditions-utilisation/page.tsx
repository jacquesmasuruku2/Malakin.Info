import { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_UPDATED_AT, SITE_EMAIL } from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - Malakinfo.com',
  description: 'Conditions d\'utilisation du site Malakinfo.com',
};

export default async function TermsOfUsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Conditions d'utilisation
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Objet du site</h2>
            <p className="text-muted-foreground">
              Malakinfo.com est un site d'information dédié à informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel. Le site propose des articles, des actualités, des analyses et des contenus multimédias sur divers sujets : politique, économie, culture, sport, religion, science et technologie.
            </p>
            <p className="text-muted-foreground mt-4">
              Il propose également des fonctionnalités complémentaires : alertes de nouvelles publications (sur le site et, avec votre accord, via les notifications du navigateur), espace compte, rubrique emploi avec candidatures et messagerie recruteur, ainsi que des services multimédias.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Accès au site</h2>
            <p className="text-muted-foreground">
              L'accès à ce site est gratuit et ouvert à tous les utilisateurs. Toutefois, certaines fonctionnalités peuvent nécessiter la création d'un compte utilisateur ou l'acceptation de conditions spécifiques (par exemple pour postuler à une offre d’emploi ou suivre une candidature).
            </p>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de restreindre l'accès à tout ou partie du site sans préavis, pour des raisons de maintenance, de mise à jour ou pour tout autre motif jugé nécessaire.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Règles d'utilisation</h2>
            <p className="text-muted-foreground">
              En utilisant ce site, vous vous engagez à respecter les règles suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Ne pas reproduire, diffuser ou utiliser le contenu du site à des fins commerciales sans autorisation</li>
              <li>Ne pas publier de contenu illégal, diffamatoire, obscène, menaçant ou offensant</li>
              <li>Ne pas tenter d'accéder frauduleusement au site ou à ses systèmes</li>
              <li>Ne pas perturber le fonctionnement normal du site</li>
              <li>Respecter les droits des autres utilisateurs et du personnel éditorial</li>
              <li>Fournir des informations exactes lors de la création d'un compte</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Compte utilisateur</h2>
            <p className="text-muted-foreground">
              Pour accéder à certaines fonctionnalités, vous pouvez créer un compte utilisateur. Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte.
            </p>
            <p className="text-muted-foreground">
              Vous nous informerez immédiatement de toute utilisation non autorisée de votre compte.
            </p>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de suspendre ou de supprimer votre compte en cas de violation de ces conditions d'utilisation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Notifications</h2>
            <p className="text-muted-foreground">
              Le site peut vous informer des nouvelles publications au moyen d’une alerte affichée dans l’interface. Si vous l’autorisez explicitement, votre navigateur pourra également afficher des notifications système. Vous pouvez refuser ou désactiver ces notifications à tout moment via les paramètres de votre navigateur ou de votre appareil.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Offres d’emploi et candidatures</h2>
            <p className="text-muted-foreground">
              La rubrique emploi permet de consulter des offres et, pour les utilisateurs connectés, de candidater et d’échanger avec le recruteur depuis l’espace compte. Vous vous engagez à fournir des informations exactes et à utiliser cette messagerie de manière loyale et respectueuse.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Commentaires et modération</h2>
            <p className="text-muted-foreground">
              Le site peut permettre aux utilisateurs de publier des commentaires sur les articles. Ces commentaires sont modérés et nous nous réservons le droit de supprimer tout commentaire qui :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Est contraire à la loi ou à la réglementation en vigueur</li>
              <li>Est diffamatoire, injurieux, raciste, sexiste ou homophobe</li>
              <li>Contient des propos haineux ou discriminatoires</li>
              <li>Est hors sujet ou répétitif</li>
              <li>Constitue du spam ou de la publicité non sollicitée</li>
              <li>Porte atteinte à la vie privée d'une personne</li>
            </ul>
            <p className="text-muted-foreground">
              Les commentaires publiés sur le site n'engagent que la responsabilité de leurs auteurs et non celle de Malakinfo.com.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble du contenu de ce site (textes, images, vidéos, sons, graphismes, logos, etc.) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable du propriétaire du site.
            </p>
            <p className="text-muted-foreground">
              Les marques et logos cités sur ce site sont la propriété de leurs détenteurs respectifs.
            </p>
            <p className="text-muted-foreground">
              Les utilisateurs conservent leurs droits sur les commentaires qu'ils publient, mais autorisent Malakinfo.com à les utiliser sur le site et dans ses communications.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Liens externes</h2>
            <p className="text-muted-foreground">
              Ce site peut contenir des liens vers des sites web tiers. Malakinfo.com n'exerce aucun contrôle sur ces sites et ne peut être tenu responsable de leur contenu ou de leurs pratiques en matière de confidentialité.
            </p>
            <p className="text-muted-foreground">
              L'inclusion de ces liens ne constitue pas une approbation par Malakinfo.com du contenu de ces sites.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Protection des données personnelles</h2>
            <p className="text-muted-foreground">
              La collecte et le traitement de vos données personnelles sont régis par notre politique de confidentialité. Tant que vous n’avez pas personnalisé vos choix, les cookies non essentiels sont acceptés par défaut. Pour les modifier, cliquez sur le bouton cookie en bas à gauche, enregistrez vos préférences, puis consultez la{' '}
              <Link href={`/${locale}/politique-confidentialite`} className="text-primary hover:underline">Politique de confidentialité</Link>
              {' '}et la{' '}
              <Link href={`/${locale}/cookies`} className="text-primary hover:underline">Politique de cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              Malakinfo.com s'efforce de fournir des informations exactes et à jour. Toutefois, nous ne pouvons garantir l'exactitude, l'exhaustivité ou la pertinence des informations publiées sur le site.
            </p>
            <p className="text-muted-foreground">
              Malakinfo.com ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Disponibilité du service</h2>
            <p className="text-muted-foreground">
              Nous nous efforçons de maintenir le site accessible en permanence. Toutefois, nous ne pouvons garantir une disponibilité continue et nous nous réservons le droit de suspendre temporairement le site pour maintenance, mises à jour ou autres raisons techniques.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Modifications des conditions</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page. Nous vous invitons à consulter régulièrement cette page pour prendre connaissance des éventuelles modifications.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Loi applicable et juridiction</h2>
            <p className="text-muted-foreground">
              Ces conditions d'utilisation sont régies par la loi en vigueur en République Démocratique du Congo. Tout litige relatif à l'utilisation du site sera soumis à la compétence des tribunaux de Kinshasa.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative à ces conditions d'utilisation, vous pouvez nous contacter à l'adresse : {SITE_EMAIL}
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
