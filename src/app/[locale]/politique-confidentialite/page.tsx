import { Metadata } from 'next';
import Link from 'next/link';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';
import { SITE_URL } from '@/lib/site-legal';
import {
  ABOUTADS_OPTOUT_URL,
  GOOGLE_ADS_SETTINGS_URL,
  GOOGLE_PARTNER_DATA_URL,
  GOOGLE_PRIVACY_POLICY_URL,
  GOOGLE_RECAPTCHA_INFO_URL,
  GOOGLE_TERMS_URL,
  HOSTING_PROVIDER,
  LEGAL_POLICIES_UPDATED_AT,
  PUBLICATION_DIRECTOR,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/site-legal';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'en') {
    return {
      title: 'Privacy policy | MalakInfo',
      description: 'Privacy policy for MalakInfo.',
      alternates: { canonical: `${SITE_URL}/fr/politique-confidentialite` },
      robots: { index: false, follow: true },
    };
  }
  return getLocalizedPageMetadata(
    locale,
    '/politique-confidentialite',
    'Politique de confidentialité',
    'Politique de confidentialité de MalakInfo, notamment sur les cookies, la publicité et les données personnelles.',
    ['fr'],
  );
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} s’engage à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et partageons vos informations lorsque vous consultez malakinfo.com.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Responsable du traitement</h2>
            <p className="text-muted-foreground">
              <strong>{PUBLICATION_DIRECTOR}</strong>, pour le média {SITE_NAME}.
            </p>
            <p className="text-muted-foreground">Adresse : {SITE_ADDRESS}</p>
            <p className="text-muted-foreground">Email : {SITE_EMAIL}</p>
            <p className="text-muted-foreground">Téléphone : {SITE_PHONE}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Données collectées</h2>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Données de navigation</h3>
            <p className="text-muted-foreground">
              Nous collectons automatiquement certaines informations lorsque vous naviguez sur le site :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Adresse IP</li>
              <li>Type de navigateur et version</li>
              <li>Système d’exploitation</li>
              <li>Pages visitées et temps passé</li>
              <li>Site de provenance</li>
              <li>Identifiants de cookies, balises web et identifiants similaires</li>
              <li>Informations techniques et interactions analysées par Google reCAPTCHA lors de l’utilisation d’un formulaire protégé (contact, compte ou newsletter)</li>
            </ul>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Données personnelles volontaires</h3>
            <p className="text-muted-foreground">Nous collectons les données que vous nous fournissez :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Nom et prénom (formulaire de contact, compte)</li>
              <li>Adresse email</li>
              <li>Contenu des messages, commentaires et candidatures</li>
              <li>Adresse e-mail, nom facultatif et thèmes choisis lors d’une inscription à la newsletter</li>
              <li>Données liées aux candidatures d’emploi (profil, messages échangés avec le recruteur via votre espace compte)</li>
              <li>Préférences de notifications stockées localement sur votre appareil (activation ou refus des alertes de publication)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Finalités du traitement</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer le site</li>
              <li>Envoyer la newsletter avec votre consentement</li>
              <li>Répondre aux demandes de contact</li>
              <li>Gérer les comptes utilisateurs</li>
              <li>Informer des nouvelles publications via des alertes sur le site et, si vous l’autorisez, des notifications du navigateur</li>
              <li>Gérer les offres d’emploi, les candidatures et les échanges avec les recruteurs</li>
              <li>Mesurer l’audience et la performance des contenus</li>
              <li>Afficher des publicités, y compris personnalisées, uniquement si vous avez accepté la catégorie correspondante</li>
              <li>Protéger les formulaires de contact, de connexion, d’inscription et d’abonnement à la newsletter contre les envois automatisés et les abus</li>
              <li>Assurer la sécurité du site</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Notifications de publication</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} peut afficher une carte d’information sur le site lorsqu’une nouvelle publication est disponible. Avec votre accord explicite (permission du navigateur), nous pouvons aussi vous envoyer des notifications système pour signaler ces nouveautés.
            </p>
            <p className="text-muted-foreground mt-4">
              Ces notifications reposent sur les API du navigateur et, le cas échéant, un service worker enregistré sur votre appareil. Elles ne sont activées qu’après votre consentement. Certaines alertes éditoriales et invitations à la newsletter peuvent apparaître au plus tôt trois minutes après l’enregistrement de votre choix de cookies. Vous pouvez refuser ou désactiver les notifications système à tout moment via les paramètres de votre navigateur ou de votre appareil. Aucune donnée de notification n’est vendue à des tiers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Compte, candidatures et messagerie</h2>
            <p className="text-muted-foreground">
              Lorsque vous créez un compte, vous pouvez notamment suivre vos candidatures aux offres d’emploi publiées sur le site et échanger des messages avec le recruteur depuis votre espace personnel. Ces données sont utilisées uniquement pour traiter votre candidature et assurer le suivi de la conversation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Base légale</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Votre consentement (inscription à la newsletter, notifications du navigateur et cookies analytiques ou publicitaires après acceptation de leurs catégories)</li>
              <li>L’exécution d’un contrat (compte utilisateur, candidatures à une offre d’emploi, dons, partenariats)</li>
              <li>Le respect d’une obligation légale</li>
              <li>Notre intérêt légitime (sécurité, amélioration du service, journalisme, information sur les nouvelles publications via l’interface du site)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Destinataires des données</h2>
            <p className="text-muted-foreground">Vos données peuvent être accessibles à :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>L’équipe éditoriale et technique de {SITE_NAME}</li>
              <li>{HOSTING_PROVIDER.name} pour l’hébergement du site</li>
              <li>Google reCAPTCHA, lorsqu’un formulaire protégé (contact, compte ou newsletter) est affiché ou envoyé, pour l’analyse de risque et la vérification anti-robot</li>
              <li>Google (Analytics, Tag Manager, AdSense) uniquement après acceptation des catégories de cookies correspondantes</li>
              <li>Telegram, pour transmettre à l’équipe une notification d’inscription à la newsletter contenant l’adresse e-mail de l’abonné</li>
              <li>Nos prestataires d’email, dans la limite nécessaire à l’envoi des messages</li>
            </ul>
            <p className="text-muted-foreground">Nous ne vendons pas vos données personnelles.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Publicité et Google AdSense</h2>
            <p className="text-muted-foreground">
              Des prestataires tiers, y compris Google, peuvent utiliser des cookies pour diffuser des annonces en fonction des visites antérieures de l’utilisateur sur ce site ou sur d’autres sites. Ces cookies ne sont activés qu’après acceptation de la catégorie publicitaire dans vos préférences.
            </p>
            <p className="text-muted-foreground">
              L’utilisation de cookies publicitaires par Google permet à Google et à ses partenaires de diffuser des annonces aux utilisateurs en fonction de leur visite sur nos sites et/ou d’autres sites sur Internet.
            </p>
            <p className="text-muted-foreground">
              Les utilisateurs peuvent désactiver la publicité personnalisée en consultant les{' '}
              <a href={GOOGLE_ADS_SETTINGS_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Paramètres des annonces
              </a>
              . Ils peuvent également se désinscrire de certains cookies publicitaires tiers via{' '}
              <a href={ABOUTADS_OPTOUT_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                aboutads.info
              </a>
              .
            </p>
            <p className="text-muted-foreground">
              Pour comprendre comment Google utilise les données lorsqu’il propose des services à des partenaires, consultez{' '}
              <a href={GOOGLE_PARTNER_DATA_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Comment Google utilise les informations des sites ou applications qui utilisent nos services
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Services tiers</h2>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Google Analytics</h3>
            <p className="text-muted-foreground">
              Google Analytics nous aide à comprendre l’usage du site. Il n’est chargé qu’après acceptation d’une catégorie de mesure d’audience. Si vous refusez ces catégories, le script Analytics n’est pas chargé.
            </p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google Tag Manager</h3>
            <p className="text-muted-foreground">
              Google Tag Manager nous permet de gérer les balises de suivi. Il n’est chargé qu’après acceptation d’une catégorie de mesure d’audience.
            </p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google AdSense</h3>
            <p className="text-muted-foreground">
              Google AdSense peut placer et lire des cookies, utiliser des balises web ou des adresses IP pour diffuser des publicités sur ce site. Les scripts publicitaires sont chargés après acceptation de la catégorie publicitaire.
            </p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google reCAPTCHA</h3>
            <p className="text-muted-foreground">
              Les formulaires de contact, de connexion, d’inscription et d’abonnement à la newsletter utilisent Google reCAPTCHA v2 afin de détecter les soumissions automatisées et de limiter les abus. Lorsque le widget est chargé, Google peut traiter des informations techniques et d’interaction, telles que l’adresse IP, des données relatives au navigateur ou à l’appareil et le cookie de sécurité <code>_GRECAPTCHA</code>, pour produire une analyse de risque. Le jeton généré est vérifié côté serveur auprès de Google. Cette protection est utilisée pour la sécurité des formulaires, indépendamment des cookies analytiques et publicitaires facultatifs.
            </p>
            <p className="text-muted-foreground">
              Pour en savoir plus, consultez la{' '}
              <a href={GOOGLE_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">règle de confidentialité de Google</a>
              , ses{' '}
              <a href={GOOGLE_TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">conditions d’utilisation</a>
              {' '}et la{' '}
              <a href={GOOGLE_RECAPTCHA_INFO_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FAQ reCAPTCHA</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Durée de conservation</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Données de contact : 3 ans après le dernier échange</li>
              <li>Newsletter : jusqu’à désabonnement</li>
              <li>Compte utilisateur : jusqu’à suppression du compte</li>
              <li>Candidatures et messages liés aux offres d’emploi : durée nécessaire au traitement, puis archivage ou suppression selon nos besoins légitimes</li>
              <li>Préférences de notifications : jusqu’à suppression locale ou révocation de la permission navigateur</li>
              <li>Données analytiques : 26 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Vos droits</h2>
            <p className="text-muted-foreground">
              Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité ou vous opposer au traitement de vos données.
            </p>
            <p className="text-muted-foreground mt-4">
              Pour exercer ces droits, écrivez à {SITE_EMAIL}.
            </p>
            <p className="text-muted-foreground mt-4">
              Pour demander votre désabonnement de la newsletter, vous pouvez également écrire à {SITE_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              Tant que vous n’avez pas accepté une catégorie, les cookies non essentiels (audience, publicité, personnalisation) restent <strong className="font-semibold text-foreground">désactivés</strong>. Les cookies strictement nécessaires au fonctionnement du site, dont le cookie de sécurité utilisé par reCAPTCHA lorsqu’un formulaire protégé est chargé, peuvent rester actifs.
            </p>
            <p className="text-muted-foreground mt-4">
              Pour modifier ce réglage par défaut :
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Cliquez sur le bouton rond en bas à gauche de n’importe quelle page (icône de cookie, « Gérer les cookies »).</li>
              <li>Dans « Gestion du consentement », choisissez <strong className="font-semibold text-foreground">Refuser</strong> ou <strong className="font-semibold text-foreground">Accepter</strong> pour chaque catégorie, ou utilisez <strong className="font-semibold text-foreground">Refuser tout</strong> / <strong className="font-semibold text-foreground">Accepter tout</strong>.</li>
              <li>Cliquez sur <strong className="font-semibold text-foreground">Enregistrer</strong>. Vos choix remplacent immédiatement le réglage par défaut.</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              Lors de votre première visite, une bannière peut aussi proposer d’accepter tous les cookies, de tout refuser ou d’ouvrir les paramètres. Fermer cette bannière sans accepter une catégorie laisse les cookies non essentiels désactivés.
            </p>
            <p className="text-muted-foreground mt-4">
              Le détail des cookies, des durées et des prestataires figure sur la page{' '}
              <Link href={`/${locale}/cookies`} className="text-primary hover:underline">
                Politique de cookies
              </Link>
              .
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
