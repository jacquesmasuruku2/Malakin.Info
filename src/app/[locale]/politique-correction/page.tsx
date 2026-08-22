import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de correction - Malakinfo.com',
  description: 'Politique de correction de Malakinfo.com',
};

export default function CorrectionPolicyPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Politique de correction
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Notre engagement envers l'exactitude</h2>
            <p className="text-muted-foreground">
              Chez Malakinfo.com, nous nous engageons à fournir une information exacte, fiable et de qualité. Nous comprenons que des erreurs peuvent survenir malgré nos efforts de vérification rigoureux. Cette politique explique comment nous traitons les demandes de correction et comment nous assurons la transparence de notre processus éditorial.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Comment signaler une erreur</h2>
            <p className="text-muted-foreground">
              Si vous constatez une erreur dans l'un de nos articles, nous vous invitons à nous en informer. Pour signaler une erreur, veuillez nous contacter par email à :
            </p>
            <p className="text-muted-foreground font-semibold">
              contact@malakinfo.com
            </p>
            <p className="text-muted-foreground mt-4">
              Dans votre message, veuillez inclure les informations suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Le titre de l'article concerné</li>
              <li>L'URL de l'article (lien vers la page)</li>
              <li>La description précise de l'erreur signalée</li>
              <li>Les preuves ou sources justifiant votre demande (si possible)</li>
              <li>Vos coordonnées (nom et email) pour que nous puissions vous répondre</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Examen de la demande</h2>
            <p className="text-muted-foreground">
              Lorsque nous recevons une demande de correction, nous procédons aux étapes suivantes :
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li><strong>Accusé de réception</strong> : Nous vous confirmons la réception de votre demande dans les 48 heures ouvrées.</li>
              <li><strong>Vérification interne</strong> : Notre équipe éditoriale examine l'erreur signalée et vérifie les informations auprès de nos sources originales.</li>
              <li><strong>Consultation des sources</strong> : Si nécessaire, nous contactons nos sources ou consultons des documents officiels pour confirmer les faits.</li>
              <li><strong>Décision</strong> : Nous décidons si une correction est nécessaire et de quelle nature.</li>
              <li><strong>Réponse</strong> : Nous vous informons de notre décision et des actions entreprises dans les 7 jours ouvrés.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Types de corrections</h2>
            <p className="text-muted-foreground">
              Selon la nature et la gravité de l'erreur, nous appliquons différents types de corrections :
            </p>
            
            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Correction mineure</h3>
            <p className="text-muted-foreground">
              Pour les erreurs mineures (fautes de frappe, erreurs grammaticales, coquilles, erreurs de ponctuation), nous corrigeons directement le texte sans notification spécifique. Ces corrections n'affectent pas le sens ou la substance de l'article.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Correction substantielle</h3>
            <p className="text-muted-foreground">
              Pour les erreurs substantielles (erreurs factuelles, erreurs dans des noms propres, dates incorrectes, chiffres erronés), nous corrigeons l'article et ajouterons une note de correction en bas de l'article indiquant la nature de la correction et la date de celle-ci.
            </p>

            <h3 className="font-heading text-xl font-semibold text-foreground mb-3 mt-6">Rétractation</h3>
            <p className="text-muted-foreground">
              Dans les cas graves où l'article contient des informations fondamentalement erronées ou trompeuses, nous pouvons décider de le rétracter. Dans ce cas, l'article sera supprimé et remplacé par une note expliquant la rétractation et les raisons de celle-ci.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Désaccord éditorial</h2>
            <p className="text-muted-foreground">
              Si vous n'êtes pas satisfait de notre décision concernant une demande de correction, vous avez le droit de demander un réexamen. Pour ce faire :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Répondez à notre email initial en expliquant les raisons de votre désaccord</li>
              <li>Fournissez des preuves supplémentaires si nécessaire</li>
              <li>Votre demande sera réexaminée par un autre membre de l'équipe éditoriale</li>
              <li>Vous recevrez une réponse finale dans les 7 jours ouvrés suivant votre demande de réexamen</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Affichage des corrections</h2>
            <p className="text-muted-foreground">
              Toutes les corrections substantielles sont clairement identifiées sur l'article concerné. Une note de correction apparaît en bas de l'article avec les informations suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>La mention "Correction" ou "Mise à jour"</li>
              <li>La date de la correction</li>
              <li>Une brève description de la correction effectuée</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              L'historique des modifications est conservé dans notre système interne pour assurer la traçabilité de toutes les corrections apportées.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Droit de réponse</h2>
            <p className="text-muted-foreground">
              Si un article vous met directement en cause ou contient des informations vous concernant que vous estimez inexactes, vous avez le droit de demander un droit de réponse. Pour exercer ce droit :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Contactez-nous à contact@malakinfo.com</li>
              <li>Précisez l'article concerné et les passages contestés</li>
              <li>Fournissez votre réponse (limitée à la longueur de l'article original)</li>
              <li>Nous publierons votre réponse dans un délai raisonnable et la lierons à l'article original</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Engagement de transparence</h2>
            <p className="text-muted-foreground">
              Malakinfo.com s'engage à :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Traiter toutes les demandes de correction avec sérieux et diligence</li>
              <li>Corriger rapidement les erreurs identifiées</li>
              <li>Être transparent sur les corrections apportées</li>
              <li>Maintenir un registre interne de toutes les corrections</li>
              <li>Former régulièrement notre équipe éditoriale aux meilleures pratiques de vérification</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative à cette politique de correction ou pour signaler une erreur, contactez-nous à :
            </p>
            <p className="text-muted-foreground font-semibold">
              Email : contact@malakinfo.com
            </p>
            <p className="text-muted-foreground">
              Téléphone : +243 998 258 441
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
