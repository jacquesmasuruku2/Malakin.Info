import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

export default function EquipePage() {
  const team = [
    {
      id: 1,
      name: 'Jean Dupont',
      role: 'Rédacteur en chef',
      background: 'ex-RFI',
      bio: 'Plus de 20 ans d\'expérience dans le journalisme international. Ancien correspondant de Radio France Internationale pour l\'Afrique centrale.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      email: 'jean.dupont@malakin.info',
    },
    {
      id: 2,
      name: 'Marie Koffi',
      role: 'Journaliste politique',
      background: 'ex-Jeune Afrique',
      bio: 'Spécialiste des questions politiques et géopolitiques africaines. Anciennement rédactrice en chef du pôle politique de Jeune Afrique.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      email: 'marie.koffi@malakin.info',
    },
    {
      id: 3,
      name: 'Ahmed Benali',
      role: 'Correspondant Maghreb',
      background: 'Journaliste indépendant',
      bio: 'Expert de la région du Maghreb avec une couverture approfondie des questions sociopolitiques nord-africaines.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      email: 'ahmed.benali@malakin.info',
    },
    {
      id: 4,
      name: 'Grace Okafor',
      role: 'Rédactrice culture',
      background: 'Ex-Le Monde Afrique',
      bio: 'Passionnée par les arts et la culture africaine. Ancienne responsable culturelle du Monde Afrique.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      email: 'grace.okafor@malakin.info',
    },
    {
      id: 5,
      name: 'Pierre Mwamba',
      role: 'Responsable Sport',
      background: 'Ex-ESPN Afrique',
      bio: 'Ancien journaliste sportif chez ESPN Afrique, spécialiste du football africain et international.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      email: 'pierre.mwamba@malakin.info',
    },
    {
      id: 6,
      name: 'Sr. Véronique Nzambi',
      role: 'Coordinatrice Religieux',
      background: 'Journaliste spécialisée',
      bio: 'Journaliste spécialisée dans les questions religieuses et spirituelles en Afrique.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      email: 'veronique.nzambi@malakin.info',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/a-propos" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à À Propos
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Notre Équipe</h1>
          <p className="text-xl text-gray-200">
            Les professionnels qui font de Malakin.info une référence
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <article
              key={member.id}
              className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-3">{member.background}</p>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {member.bio}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {member.email}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Rejoindre notre équipe
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
