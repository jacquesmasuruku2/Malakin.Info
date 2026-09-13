import { Metadata } from 'next';
import {
  ABOUTADS_OPTOUT_URL,
  GOOGLE_ADS_SETTINGS_URL,
  GOOGLE_PARTNER_DATA_URL,
  HOSTING_PROVIDER,
  LEGAL_UPDATED_AT,
  PUBLICATION_DIRECTOR,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
} from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - Malakinfo.com',
  description: 'Politique de confidentialité de Malakinfo.com, y compris l’usage de Google AdSense, des cookies et des données personnelles.',
};

export default function PrivacyPolicyPage() {
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
            </ul>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Données personnelles volontaires</h3>
            <p className="text-muted-foreground">Nous collectons les données que vous nous fournissez :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Nom et prénom (formulaire de contact, compte, newsletter)</li>
              <li>Adresse email</li>
              <li>Contenu des messages, commentaires et candidatures</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Finalités du traitement</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer le site</li>
              <li>Envoyer la newsletter avec votre consentement</li>
              <li>Répondre aux demandes de contact</li>
              <li>Gérer les comptes utilisateurs</li>
              <li>Mesurer l’audience et la performance des contenus</li>
              <li>Afficher des publicités, y compris des publicités personnalisées si vous y consentez</li>
              <li>Assurer la sécurité du site</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Base légale</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Votre consentement (newsletter, cookies analytiques et publicitaires)</li>
              <li>L’exécution d’un contrat (compte utilisateur, dons, partenariats)</li>
              <li>Le respect d’une obligation légale</li>
              <li>Notre intérêt légitime (sécurité, amélioration du service, journalisme)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Destinataires des données</h2>
            <p className="text-muted-foreground">Vos données peuvent être accessibles à :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>L’équipe éditoriale et technique de {SITE_NAME}</li>
              <li>{HOSTING_PROVIDER.name} pour l’hébergement du site</li>
              <li>Google (Analytics, Tag Manager, AdSense) lorsque vous y consentez</li>
              <li>Nos prestataires d’email, dans la limite nécessaire à l’envoi des messages</li>
            </ul>
            <p className="text-muted-foreground">Nous ne vendons pas vos données personnelles.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Publicité et Google AdSense</h2>
            <p className="text-muted-foreground">
              Des prestataires tiers, y compris Google, utilisent des cookies pour diffuser des annonces en fonction des visites antérieures de l’utilisateur sur ce site ou sur d’autres sites.
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
              Google Analytics nous aide à comprendre l’usage du site. Ces cookies ne sont déposés qu’avec votre consentement.
            </p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google Tag Manager</h3>
            <p className="text-muted-foreground">
              Google Tag Manager nous permet de gérer les balises de suivi après recueil de votre consentement.
            </p>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google AdSense</h3>
            <p className="text-muted-foreground">
              Google AdSense peut placer et lire des cookies, utiliser des balises web ou des adresses IP pour diffuser des publicités sur ce site.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Durée de conservation</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Données de contact : 3 ans après le dernier échange</li>
              <li>Newsletter : jusqu’à désabonnement</li>
              <li>Compte utilisateur : jusqu’à suppression du compte</li>
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
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              Une bannière de consentement vous permet d’accepter, de refuser ou de paramétrer les cookies. Le détail figure sur la page{' '}
              <a href="/fr/cookies" className="text-primary hover:underline">
                Politique de cookies
              </a>
              .
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
