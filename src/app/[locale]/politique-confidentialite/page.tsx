import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - Malakinfo.com',
  description: 'Politique de confidentialité de Malakinfo.com',
};

export default function PrivacyPolicyPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
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
              Malakinfo.com s'engage à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Responsable du traitement</h2>
            <p className="text-muted-foreground">
              <strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong>
            </p>
            <p className="text-muted-foreground">
              Le responsable du traitement des données est : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Vous pouvez nous contacter à l'adresse : contact@malakinfo.com
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Données collectées</h2>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Données de navigation</h3>
            <p className="text-muted-foreground">
              Nous collectons automatiquement certaines informations lorsque vous naviguez sur notre site :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Adresse IP</li>
              <li>Type de navigateur et version</li>
              <li>Système d'exploitation</li>
              <li>Pages visitées et temps passé</li>
              <li>Site de provenance</li>
            </ul>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Données personnelles volontaires</h3>
            <p className="text-muted-foreground">
              Nous collectons les données que vous nous fournissez volontairement :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Nom et prénom (formulaire de contact)</li>
              <li>Adresse email (newsletter, compte utilisateur)</li>
              <li>Contenu des messages (formulaire de contact, commentaires)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Finalités du traitement</h2>
            <p className="text-muted-foreground">
              Vos données sont collectées pour les finalités suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Envoyer la newsletter (avec votre consentement)</li>
              <li>Répondre à vos demandes via le formulaire de contact</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Analyser l'utilisation du site pour améliorer nos services</li>
              <li>Assurer la sécurité du site</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Base légale</h2>
            <p className="text-muted-foreground">
              Le traitement de vos données est basé sur :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Votre consentement (newsletter, cookies)</li>
              <li>L'exécution d'un contrat (compte utilisateur)</li>
              <li>Le respect d'une obligation légale</li>
              <li>Notre intérêt légitime (amélioration du service, sécurité)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Destinataires des données</h2>
            <p className="text-muted-foreground">
              Vos données sont accessibles à :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>L'équipe de Malakinfo.com</li>
              <li><strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong> - Prestataires techniques (hébergement, email)</li>
            </ul>
            <p className="text-muted-foreground">
              Nous ne vendons pas vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Services tiers</h2>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Google Analytics</h3>
            <p className="text-muted-foreground">
              Nous utilisons Google Analytics pour analyser l'utilisation de notre site. Google collecte des données anonymisées sur votre navigation. Pour en savoir plus, consultez la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">politique de confidentialité de Google</a>.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google AdSense</h3>
            <p className="text-muted-foreground">
              Nous utilisons Google AdSense pour afficher des publicités. Google peut utiliser des cookies pour personnaliser les annonces en fonction de vos centres d'intérêt. Pour en savoir plus, consultez la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">politique de confidentialité de Google</a>.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Google Tag Manager</h3>
            <p className="text-muted-foreground">
              Nous utilisons Google Tag Manager pour gérer nos balises de suivi. Pour en savoir plus, consultez la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">politique de confidentialité de Google</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Durée de conservation</h2>
            <p className="text-muted-foreground">
              Vos données sont conservées pendant une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Données de contact : 3 ans après le dernier contact</li>
              <li>Données newsletter : jusqu'à votre désabonnement</li>
              <li>Données compte utilisateur : jusqu'à la suppression du compte</li>
              <li>Données analytiques : 26 mois (paramètre par défaut de Google Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Droit d'accès</strong> : demander une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Pour exercer ces droits, contactez-nous à : contact@malakinfo.com
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience de navigation. Pour en savoir plus sur les cookies utilisés et vos options, consultez notre page <a href="/cookies" className="text-primary hover:underline">Politique de cookies</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Sécurité</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification, la divulgation ou la destruction.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Modifications</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier cette politique de confidentialité. Les modifications seront publiées sur cette page avec la date de mise à jour.
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
