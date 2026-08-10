import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Book, Church } from 'lucide-react';

export default function Les7AgesDeLEglisePage() {
  const sections = [
    {
      id: 1,
      title: 'L\'Âge d\'Éphèse',
      period: '30-100 après J.C.',
      description: 'L\'Église primitive, caractérisée par son amour ardent et sa dévotion pure.',
      characteristics: ['Amour ardent', 'Dévotion pure', 'Unité parfaite', 'Puissance spirituelle'],
    },
    {
      id: 2,
      title: 'L\'Âge de Smyrne',
      period: '100-313 après J.C.',
      description: 'L\'Église persécutée, fidèle dans les épreuves et les martyres.',
      characteristics: ['Persécution', 'Fidélité', 'Martyre', 'Endurance'],
    },
    {
      id: 3,
      title: 'L\'Âge de Pergame',
      period: '313-606 après J.C.',
      description: 'L\'Église compromise, s\'alliant avec le pouvoir politique.',
      characteristics: ['Compromis', 'Alliances politiques', 'Perte de pureté', 'Mondanisation'],
    },
    {
      id: 4,
      title: 'L\'Âge de Thyatire',
      period: '606-1520 après J.C.',
      description: 'L\'Âge des Ténèbres, marqué par l\'idolâtrie et les fausses doctrines.',
      characteristics: ['Idolâtrie', 'Fausses doctrines', 'Obscurantisme', 'Corruption'],
    },
    {
      id: 5,
      title: 'L\'Âge de Sardes',
      period: '1520-1750 après J.C.',
      description: 'La Réforme, un réveil spirituel mais avec une œuvre inachevée.',
      characteristics: ['Réforme', 'Réveil', 'Œuvre inachevée', 'Nom de vivant mais mort'],
    },
    {
      id: 6,
      title: 'L\'Âge de Philadelphie',
      period: '1750-1906 après J.C.',
      description: 'L\'Église missionnaire, caractérisée par l\'amour fraternel et l\'évangélisation.',
      characteristics: ['Amour fraternel', 'Mission', 'Porte ouverte', 'Foi authentique'],
    },
    {
      id: 7,
      title: 'L\'Âge de Laodicée',
      period: '1906-présent',
      description: 'L\'Église tiède, riche matériellement mais pauvre spirituellement.',
      characteristics: ['Tiédeur', 'Richesse matérielle', 'Pauvreté spirituelle', 'Autosuffisance'],
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/religion" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Les 7 Âges de l'Église</h1>
          <p className="text-xl text-gray-200">
            Une étude prophétique des sept périodes de l'Église chrétienne selon l'Apocalypse
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="bg-card rounded-lg p-6 border-l-4 border-primary">
            <h2 className="font-heading text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les sept âges de l'Église sont révélés dans les chapitres 2 et 3 de l'Apocalypse, où le Seigneur Jésus 
              s'adresse aux sept églises d'Asie. Ces messages prophétiques décrivent l'histoire de l'Église chrétienne 
              depuis sa fondation jusqu'au retour du Christ, chaque âge ayant ses caractéristiques spirituelles 
              distinctives et ses défis particuliers.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <article
              key={section.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{section.period}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {section.description}
                </p>
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Church className="w-5 h-5 text-primary" />
                    Caractéristiques principales
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {section.characteristics.map((characteristic) => (
                      <span
                        key={characteristic}
                        className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                      >
                        {characteristic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 bg-card rounded-lg p-6 border-l-4 border-accent">
          <h2 className="font-heading text-2xl font-bold mb-4">Conclusion</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            L'étude des sept âges de l'Église nous permet de comprendre l'histoire spirituelle de l'Église 
            et de discerner les temps dans lesquels nous vivons. Chaque âge nous enseigne des leçons 
            importantes sur la fidélité, la compromission, et la nécessité de maintenir notre amour 
            premier pour Christ.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Comme l'Église de Philadelphie, nous sommes appelés à garder la parole de Christ et à ne pas 
            renier son nom, en attendant avec espérance son retour glorieux.
          </p>
        </div>
      </div>
    </div>
  );
}
