import { Metadata } from 'next';
import Link from 'next/link';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';
import { SITE_URL } from '@/lib/site-legal';
import {
  GOOGLE_PRIVACY_POLICY_URL,
  GOOGLE_TERMS_URL,
  LEGAL_POLICIES_UPDATED_AT,
  SITE_EMAIL,
} from '@/lib/site-legal';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'en') {
    return {
      title: 'Terms of use | MalakInfo',
      description: 'Terms of use for MalakInfo.',
      alternates: { canonical: `${SITE_URL}/fr/conditions-utilisation` },
      robots: { index: false, follow: true },
    };
  }
  return getLocalizedPageMetadata(locale, '/conditions-utilisation', 'Conditions d’utilisation', 'Conditions d’utilisation du site MalakInfo.', ['fr']);
}

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
              MalakInfo est un média d’information consacré à l’Afrique et au monde. Il publie des articles, des actualités, des analyses et des contenus multimédias sur la politique, l’économie, la culture, le sport, la religion, la santé et les nouvelles technologies.
            </p>
            <p className="text-muted-foreground mt-4">
              Le site propose également des scores et classements sportifs, des informations sur les marchés et une calculatrice de conversion, une radio en direct, une rubrique emploi, une newsletter et des alertes de publication. Certaines fonctions nécessitent un compte ou l’autorisation du navigateur.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Accès au site</h2>
            <p className="text-muted-foreground">
              La consultation des contenus publics est généralement gratuite. Certaines fonctions nécessitent un compte. Des articles premium peuvent être achetés à l’unité et des formules de soutien ou des dons peuvent être proposés. Le montant, la devise et les conditions applicables sont indiqués avant le paiement.
            </p>
            <p className="text-muted-foreground">
              Les paiements sont effectués au moyen du service de paiement Stripe. Les informations de paiement sont traitées selon les modalités présentées lors du paiement et les politiques de Stripe. Nous pouvons suspendre temporairement certaines fonctions pour maintenance ou raisons techniques.
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
              Le site peut vous informer des nouvelles publications au moyen d’une alerte affichée dans l’interface. Certaines alertes et invitations à la newsletter peuvent apparaître au plus tôt trois minutes après l’enregistrement de votre choix de cookies. Si vous l’autorisez explicitement, votre navigateur pourra également afficher des notifications système. Vous pouvez refuser ou désactiver ces notifications à tout moment via les paramètres de votre navigateur ou de votre appareil.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Newsletter et protection des formulaires</h2>
            <p className="text-muted-foreground">
              L’inscription à la newsletter est facultative et nécessite votre accord explicite. Pour demander votre désabonnement à tout moment, écrivez à {SITE_EMAIL}.
            </p>
            <p className="text-muted-foreground mt-4">
              Les formulaires de contact, de connexion, d’inscription et d’abonnement à la newsletter sont protégés par Google reCAPTCHA afin de limiter les envois automatisés et les abus. Cette vérification peut traiter des informations techniques et d’interaction, notamment via le cookie <code>_GRECAPTCHA</code>. En utilisant ces formulaires, vous interagissez avec le service Google, régi par sa{' '}
              <a href={GOOGLE_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">règle de confidentialité</a>
              {' '}et ses{' '}
              <a href={GOOGLE_TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">conditions d’utilisation</a>.
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
              Ce site peut contenir des liens ou intégrer des services de tiers. MalakInfo ne contrôle pas les sites ou services externes ni leurs pratiques en matière de confidentialité. Leur utilisation est régie par leurs propres conditions.
            </p>
            <p className="text-muted-foreground">
              La lecture de la radio ou l’affichage de certains outils intégrés peut dépendre de prestataires externes et de leur disponibilité.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              Scores, marchés et calculatrice
            </h2>
            <p className="text-muted-foreground">
              Les scores, classements et statistiques sportives, ainsi que les cours des crypto-actifs, des métaux et les taux de change, proviennent de sources de données tierces. Ils peuvent être retardés, incomplets ou indisponibles. La calculatrice fournit une estimation à partir des cours affichés ; elle ne constitue ni un conseil financier ni une offre d’achat ou de vente. Elle ne permet pas de passer d’ordre d’achat ou de vente de crypto-actifs, et MalakInfo ne conserve pas de crypto-actifs pour votre compte. Cette précision ne concerne pas les paiements d’articles premium, de formules de soutien ou de dons traités par Stripe.
            </p>
            <p className="text-muted-foreground mt-4">
              Vérifiez les informations auprès de sources officielles avant de prendre une décision. Les cours et résultats peuvent changer sans préavis.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Protection des données personnelles</h2>
            <p className="text-muted-foreground">
              La collecte et le traitement de vos données personnelles sont régis par notre politique de confidentialité. Les cookies non essentiels restent désactivés tant que vous n’avez pas accepté les catégories correspondantes. Pour modifier vos choix, cliquez sur le bouton cookie en bas à gauche, enregistrez vos préférences, puis consultez la{' '}
              <Link href={`/${locale}/politique-confidentialite`} className="text-primary hover:underline">Politique de confidentialité</Link>
              {' '}et la{' '}
              <Link href={`/${locale}/cookies`} className="text-primary hover:underline">Politique de cookies</Link>.
            </p>
            <p className="text-muted-foreground mt-4">
              Des publicités peuvent être proposées sur certaines pages par Google AdSense lorsque vos choix de consentement autorisent les catégories correspondantes. Les modalités sont détaillées dans la politique de confidentialité et la politique de cookies.
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
              Date de dernière mise à jour : {LEGAL_POLICIES_UPDATED_AT}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
