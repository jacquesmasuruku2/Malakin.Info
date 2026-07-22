import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos - Malakin.info',
  description: 'Découvrez Malakin.info - L\'info qui traverse les frontières',
};

export default function AboutPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          À propos de Malakin.info
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground text-lg mb-6">
            Malakin.info est une plateforme d'information indépendante dédiée à informer, éduquer et connecter l'Afrique à travers un journalisme fiable et multiculturel.
          </p>
          <p className="text-muted-foreground text-lg mb-6">
            Notre mission est de fournir une couverture médiatique de qualité qui traverse les frontières, en mettant en lumière les histoires qui comptent pour le continent africain et sa diaspora.
          </p>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">
            Notre Mission
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Nous nous engageons à:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-lg mb-6 space-y-2">
            <li>Informer avec intégrité et précision</li>
            <li>Éduquer à travers des contenus de qualité</li>
            <li>Connecter les communautés africaines</li>
            <li>Valoriser la diversité culturelle</li>
            <li>Promouvoir le journalisme indépendant</li>
          </ul>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">
            Notre Équipe
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Notre équipe est composée de journalistes passionnés, d'experts et de créateurs engagés à faire la différence à travers leur travail.
          </p>
        </div>
      </div>
    </div>
  );
}
