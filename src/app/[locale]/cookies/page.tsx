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
              Un cookie est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site. Il permet de mémoriser vos préférences, de mesurer l’audience et d’afficher des publicités. Les cookies non essentiels sont acceptés par défaut tant que vous n’avez pas personnalisé vos choix.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Consentement par défaut</h2>
            <p className="text-muted-foreground">
              Tant que vous n’avez pas personnalisé vos choix, MalakInfo considère que les cookies non essentiels (mesure d’audience, publicité, personnalisation des contenus) sont <strong className="font-semibold text-foreground">acceptés par défaut</strong> et les applique. Les cookies strictement nécessaires au fonctionnement du site restent toujours actifs.
            </p>
            <p className="text-muted-foreground mt-3">
              Vous pouvez à tout moment refuser tout ou partie de ces cookies, ou revenir à une acceptation complète, en suivant la procédure ci-dessous. Vos nouveaux choix remplacent alors le réglage par défaut et sont mémorisés sur votre appareil.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Comment modifier vos choix</h2>
            <p className="text-muted-foreground mb-4">
              Pour changer le consentement par défaut, procédez ainsi :
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
              <li>
                Sur n’importe quelle page du site, cliquez sur le bouton rond en bas à gauche de l’écran : icône de cookie bleu sur fond blanc. Au survol, le libellé « Gérer les cookies » s’affiche.
              </li>
              <li>
                La fenêtre « Gestion du consentement » s’ouvre. Pour chaque catégorie, choisissez <strong className="font-semibold text-foreground">Refuser</strong> ou <strong className="font-semibold text-foreground">Accepter</strong>.
              </li>
              <li>
                Vous pouvez aussi utiliser <strong className="font-semibold text-foreground">Refuser tout</strong> ou <strong className="font-semibold text-foreground">Accepter tout</strong> en bas de la fenêtre.
              </li>
              <li>
                Cliquez sur <strong className="font-semibold text-foreground">Enregistrer</strong> pour appliquer et mémoriser vos choix. Ils sont pris en compte immédiatement (audience, publicité, etc.).
              </li>
              <li>
                Lors de votre première visite, une bannière peut aussi apparaître. Elle propose les mêmes actions : accepter tous les cookies, tout refuser, ou ouvrir les paramètres. Fermer cette bannière sans personnaliser conserve l’acceptation par défaut.
              </li>
            </ol>
            <p className="text-muted-foreground mt-4">
              Vous pouvez également restreindre les cookies depuis les paramètres de votre navigateur, ou désactiver la publicité personnalisée Google via les liens de la section « Publicité Google » ci-dessous. Pour toute question, écrivez à {SITE_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Bannière de consentement</h2>
            <p className="text-muted-foreground">
              MalakInfo peut afficher une bannière de consentement lors de votre première visite. Tant que vous n’avez pas personnalisé vos réglages, les cookies analytiques et publicitaires sont activés par défaut. Si vous refusez une catégorie ou cliquez sur « Refuser tout », ce refus est enregistré et appliqué à la place du réglage par défaut.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Notifications et stockage local</h2>
            <p className="text-muted-foreground">
              Indépendamment des cookies, MalakInfo peut utiliser le stockage local du navigateur et, avec votre permission, l’API de notifications ainsi qu’un service worker pour vous alerter des nouvelles publications. Ces mécanismes ne déposent pas de cookies publicitaires ; l’activation des notifications système nécessite votre accord explicite et peut être révoquée dans les paramètres du navigateur.
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
                    <td className="border border-border px-4 py-2 text-muted-foreground">Accepté par défaut, sauf refus</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">IDE, NID</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google AdSense</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicité, y compris personnalisée</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicitaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">6 mois à 1 an</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Accepté par défaut, sauf refus</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">malakinfo_cookie_consent</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">MalakInfo</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Mémoriser que vos choix ont été personnalisés</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">12 mois</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">malakinfo_cookie_preferences</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">MalakInfo</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Mémoriser vos catégories de cookies acceptées ou refusées</td>
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
              <li>Cliquez sur le bouton cookie en bas à gauche de n’importe quelle page, puis enregistrez vos choix (voir la procédure détaillée ci-dessus)</li>
              <li>Utilisez la bannière de consentement lors de votre première visite</li>
              <li>Modifiez les paramètres de votre navigateur</li>
              <li>Écrivez-nous à {SITE_EMAIL}</li>
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
