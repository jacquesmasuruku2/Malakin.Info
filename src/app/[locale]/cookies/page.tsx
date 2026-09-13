import { Metadata } from 'next';
import {
  ABOUTADS_OPTOUT_URL,
  GOOGLE_ADS_SETTINGS_URL,
  GOOGLE_PARTNER_DATA_URL,
  LEGAL_UPDATED_AT,
  SITE_EMAIL,
} from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Politique de cookies - Malakinfo.com',
  description: 'Politique de cookies de Malakinfo.com',
};

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Politique de cookies
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Qu’est-ce qu’un cookie ?</h2>
            <p className="text-muted-foreground">
              Un cookie est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site. Il permet de mémoriser vos préférences, de mesurer l’audience et, si vous y consentez, d’afficher des publicités.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Bannière de consentement</h2>
            <p className="text-muted-foreground">
              MalakInfo affiche une bannière de consentement dès votre première visite. Vous pouvez accepter tous les cookies, les refuser, ou ouvrir les paramètres pour choisir catégorie par catégorie. Les cookies analytiques et publicitaires ne sont activés qu’après votre accord.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Tableau des cookies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Nom</th>
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Fournisseur</th>
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Finalité</th>
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Catégorie</th>
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Durée</th>
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Consentement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">_ga, _gid, _gat</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google Analytics</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Mesure d’audience</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Analytique</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">24 heures à 2 ans</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">IDE, NID</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google AdSense</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicité, y compris personnalisée</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicitaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">6 mois à 1 an</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">malakinfo_cookie_consent</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">MalakInfo</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Mémoriser votre choix de cookies</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">12 mois</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">next-auth.session-token</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">MalakInfo</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Session de connexion</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Session</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Publicité Google</h2>
            <p className="text-muted-foreground">
              Google et des prestataires tiers peuvent lire ou déposer des cookies pour diffuser des annonces selon vos visites précédentes. Vous pouvez désactiver la publicité personnalisée via les{' '}
              <a href={GOOGLE_ADS_SETTINGS_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paramètres des annonces Google</a>
              {' '}ou{' '}
              <a href={ABOUTADS_OPTOUT_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aboutads.info</a>.
            </p>
            <p className="text-muted-foreground">
              Plus d’informations :{' '}
              <a href={GOOGLE_PARTNER_DATA_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Comment Google utilise les informations des sites partenaires
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Gérer vos choix</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Utiliser la bannière de consentement affichée sur le site</li>
              <li>Modifier les paramètres de votre navigateur</li>
              <li>Nous écrire à {SITE_EMAIL}</li>
            </ul>
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
