import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales - Malakinfo.com',
  description: 'Mentions légales du site Malakinfo.com',
};

export default function LegalNoticesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
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
              <strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong>
            </p>
            <p className="text-muted-foreground">
              Nom de l'entreprise ou de l'organisation : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Forme juridique : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Capital social : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Adresse du siège social : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Responsable de publication</h2>
            <p className="text-muted-foreground">
              <strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong>
            </p>
            <p className="text-muted-foreground">
              Nom et prénom : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Fonction : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Coordonnées de contact</h2>
            <p className="text-muted-foreground">
              Email : contact@malakinfo.com
            </p>
            <p className="text-muted-foreground">
              Téléphone : +243 998 258 441
            </p>
            <p className="text-muted-foreground">
              Adresse : Kinshasa, République Démocratique du Congo
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Hébergeur</h2>
            <p className="text-muted-foreground">
              <strong>[À COMPLÉTER PAR LE PROPRIÉTAIRE]</strong>
            </p>
            <p className="text-muted-foreground">
              Nom de l'hébergeur : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Adresse de l'hébergeur : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
            </p>
            <p className="text-muted-foreground">
              Téléphone de l'hébergeur : [À COMPLÉTER PAR LE PROPRIÉTAIRE]
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
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Contenus provenant de tiers</h2>
            <p className="text-muted-foreground">
              Ce site peut contenir des contenus provenant de sources tierces (agences de presse, partenaires, etc.). Ces contenus sont utilisés avec l'autorisation de leurs auteurs ou dans le cadre d'une licence d'utilisation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Liens externes</h2>
            <p className="text-muted-foreground">
              Ce site peut contenir des liens vers des sites web tiers. Malakinfo.com n'exerce aucun contrôle sur ces sites et ne peut être tenu responsable de leur contenu ou de leurs pratiques en matière de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Signalement d'une erreur ou d'un contenu illicite</h2>
            <p className="text-muted-foreground">
              Si vous constatez une erreur ou un contenu illicite sur ce site, vous pouvez nous en informer en envoyant un email à contact@malakinfo.com en précisant l'URL de la page concernée et la nature du problème.
            </p>
            <p className="text-muted-foreground">
              Nous nous engageons à examiner votre demande dans les plus brefs délais et à prendre les mesures appropriées si nécessaire.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Données personnelles</h2>
            <p className="text-muted-foreground">
              La collecte et le traitement de vos données personnelles sont régis par notre politique de confidentialité. Pour en savoir plus, consultez notre page <a href="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              Ce site utilise des cookies pour améliorer votre expérience de navigation. Pour en savoir plus sur l'utilisation des cookies et vos options, consultez notre page <a href="/cookies" className="text-primary hover:underline">Politique de cookies</a>.
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
