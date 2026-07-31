import Link from 'next/link';
import { Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function ChartePage() {
  const principles = [
    {
      id: 1,
      title: 'Vérification rigoureuse des sources',
      description: 'Toutes nos informations sont vérifiées auprès de sources multiples et fiables avant publication. Nous ne publions aucune information sans confirmation croisée.',
      icon: CheckCircle,
    },
    {
      id: 2,
      title: 'Neutralité politique et confessionnelle',
      description: 'Nous maintenons une position indépendante et ne servons aucun agenda politique ou religieux. Notre couverture est équilibrée et présente tous les points de vue.',
      icon: CheckCircle,
    },
    {
      id: 3,
      title: 'Droit de réponse accordé à tout citoyen',
      description: 'Toute personne mentionnée dans nos articles a le droit de répondre et de s\'exprimer. Nous publions systématiquement les réponses lorsque demandées.',
      icon: CheckCircle,
    },
    {
      id: 4,
      title: 'Transparence sur les financements',
      description: 'Nos sources de financement sont publiques pour garantir notre indépendance éditoriale. Nous refusons tout financement qui pourrait compromettre notre intégrité.',
      icon: CheckCircle,
    },
    {
      id: 5,
      title: 'Respect de la vie privée',
      description: 'Nous respectons scrupuleusement la vie privée des individus, sauf lorsque l\'intérêt public justifie une divulgation.',
      icon: CheckCircle,
    },
    {
      id: 6,
      title: 'Correction des erreurs',
      description: 'En cas d\'erreur, nous nous engageons à la corriger rapidement et de manière visible. La transparence sur nos erreurs renforce la confiance.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/a-propos" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à À Propos
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Notre Charte Éthique</h1>
          <p className="text-xl text-gray-200">
            Nos engagements envers l'intégrité journalistique
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Charte Éthique</h2>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            Malakinfo s'engage à respecter les plus hauts standards du journalisme. Notre charte éthique définit les principes qui guident notre travail quotidien.
          </p>

          <div className="space-y-6">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.id}
                  className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        {principle.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-6">
              Cette charte est un document vivant qui évolue avec les défis du journalisme moderne. Nous nous engageons à la réviser régulièrement pour refléter les meilleures pratiques de notre profession.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/a-propos/mission"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                Notre mission
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/a-propos/equipe"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                Notre équipe
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
