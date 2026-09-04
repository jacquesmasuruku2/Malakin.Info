import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diplomatie et Relations Internationales - Malakinfo.com',
  description: 'Suivez l\'actualité diplomatique et les relations internationales africaines avec Malakinfo.com',
};

export default function DiplomatiePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Diplomatie et Relations Internationales
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground text-lg mb-6">
            Suivez l'actualité diplomatique africaine et les relations internationales qui façonnent l'avenir du continent.
          </p>
          <p className="text-muted-foreground text-lg mb-6">
            Malakinfo.com vous informe sur les développements diplomatiques, les accords internationaux, les sommets régionaux et les enjeux géopolitiques qui impactent l'Afrique.
          </p>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">
            Notre Couverture Diplomatique
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Nous couvrons :
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-lg mb-6 space-y-2">
            <li>Sommets et rencontres diplomatiques</li>
            <li>Accords commerciaux et économiques</li>
            <li>Relations Afrique-Europe et Afrique-Asie</li>
            <li>Coopération régionale et intégration</li>
            <li>Politique étrangère des États africains</li>
            <li>Diplomatie culturelle et éducative</li>
          </ul>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">
            Enjeux Géopolitiques
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Notre analyse porte sur les grands enjeux qui définissent la position de l'Afrique sur la scène internationale :
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-lg mb-6 space-y-2">
            <li>Souveraineté et indépendance économique</li>
            <li>Nouvelles alliances stratégiques</li>
            <li>Gestion des ressources naturelles</li>
            <li>Diaspora et relations transnationales</li>
            <li>Développement durable et climat</li>
            <li>Sécurité et coopération régionale</li>
          </ul>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">
            Institutions Internationales
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Nous suivons également l'activité des organisations internationales et régionales :
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-lg mb-6 space-y-2">
            <li>Union Africaine</li>
            <li>Communauté Économique des États de l'Afrique de l'Ouest (CEDEAO)</li>
            <li>Communauté de développement d'Afrique australe (SADC)</li>
            <li>Organisation des Nations Unies (ONU)</li>
            <li>Union Européenne et partenariats</li>
            <li>Organisations régionales spécialisées</li>
          </ul>
        </div>
      </div>
    </div>
  );
}