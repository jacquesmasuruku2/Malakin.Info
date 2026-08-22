import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de cookies - Malakinfo.com',
  description: 'Politique de cookies de Malakinfo.com',
};

export default function CookiesPolicyPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Politique de cookies
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Qu'est-ce qu'un cookie ?</h2>
            <p className="text-muted-foreground">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, mobile) lorsque vous visitez un site web. Il permet au site de se souvenir de vos préférences et d'améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookies utilisés sur Malakinfo.com</h2>
            <p className="text-muted-foreground">
              Nous utilisons différents types de cookies pour assurer le bon fonctionnement de notre site et améliorer votre expérience.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Tableau des cookies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Nom du cookie</th>
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
                    <td className="border border-border px-4 py-2 text-muted-foreground">Analyse de l'audience et du comportement des visiteurs</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Analytique</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">2 ans à 24 heures</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">IDE, NID</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google DoubleClick / AdSense</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicité personnalisée</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicitaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">1 an à 6 mois</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">_gcl_au</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google Ads</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Conversion et suivi des campagnes publicitaires</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Publicitaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">90 jours</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">next-auth.session-token</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Malakinfo.com (NextAuth)</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Authentification utilisateur et gestion de session</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Session</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non (nécessaire)</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">sessionToken</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Malakinfo.com</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Authentification alternative</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Variable</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non (nécessaire)</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">user</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Malakinfo.com</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Stockage local des informations utilisateur</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Variable</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non (nécessaire)</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">token</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Malakinfo.com</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Stockage local du token d'authentification</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Nécessaire</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Variable</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Non (nécessaire)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Catégories de cookies</h2>
            
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Cookies nécessaires</h3>
            <p className="text-muted-foreground">
              Ces cookies sont essentiels au fonctionnement du site. Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités de base. Sans ces cookies, certains services ne peuvent pas être fournis.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Cookies analytiques</h3>
            <p className="text-muted-foreground">
              Ces cookies nous permettent d'analyser l'utilisation du site pour en améliorer le contenu et les fonctionnalités. Ils collectent des données anonymisées sur le nombre de visiteurs, les pages visitées, etc.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Cookies publicitaires</h3>
            <p className="text-muted-foreground">
              Ces cookies sont utilisés pour afficher des publicités pertinentes en fonction de vos centres d'intérêt. Ils peuvent également être utilisés pour limiter le nombre de fois où vous voyez une publicité.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Gestion des cookies</h2>
            <p className="text-muted-foreground">
              Vous pouvez gérer vos préférences en matière de cookies de plusieurs manières :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Modifier les paramètres de votre navigateur pour bloquer ou supprimer les cookies</li>
              <li>Utiliser les outils de gestion des cookies fournis par certains navigateurs</li>
              <li><strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong> - Utiliser notre bannière de consentement cookies (si implémentée)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Notez que le blocage de certains cookies peut affecter le fonctionnement du site.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Liens utiles</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Politique de cookies de Google</a></li>
              <li><a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Informations générales sur les cookies</a></li>
              <li><a href="/politique-confidentialite" className="text-primary hover:underline">Notre politique de confidentialité</a></li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Mises à jour</h2>
            <p className="text-muted-foreground">
              Nous pouvons mettre à jour cette politique de cookies pour refléter les changements dans nos pratiques ou pour des raisons réglementaires. Les modifications seront publiées sur cette page.
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Date de dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
