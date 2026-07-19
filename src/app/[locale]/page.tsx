import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Target, Users, Shield, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AProposPage() {
  let authors: any[] = [];
  
  try {
    authors = await prisma.author.findMany({
      take: 6,
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }

  const team = authors.map(author => ({
    id: author.id,
    name: author.name,
    role: author.role || 'Journaliste',
    background: '',
    image: author.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  }));

  const values = [
    {
      icon: Target,
      title: 'Notre Mission',
      description: 'Informer, éduquer et connecter l\'Afrique à travers un journalisme indépendant, fiable et multiculturel.',
    },
    {
      icon: Users,
      title: 'Notre Équipe',
      description: 'Une équipe de professionnels expérimentés passionnés par l\'Afrique et son avenir.',
 href: '/a-propos/equipe',
    },
    {
      icon: Shield,
      title: 'Notre Charte',
      description: 'Un engagement envers l\'éthique journalistique et la vérité.',
      href: '/a-propos/charte',
    },
  ];

  const charterPoints = [
    {
      title: 'Vérification rigoureuse des sources',
      description: 'Toutes nos informations sont vérifiées auprès de sources multiples et fiables avant publication.',
    },
    {
      title: 'Neutralité politique et confessionnelle',
      description: 'Nous maintenons une position indépendante et ne servons aucun agenda politique ou religieux.',
    },
    {
      title: 'Droit de réponse accordé à tout citoyen',
      description: 'Toute personne mentionnée dans nos articles a le droit de répondre et de s\'exprimer.',
    },
    {
      title: 'Transparence sur les financements',
      description: 'Nos sources de financement sont publiques pour garantir notre indépendance éditoriale.',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">À Propos</h1>
          <p className="text-xl text-gray-200">
            Découvrez Arizona.info, votre source d'information indépendante sur l'Afrique et le monde
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-card rounded-lg p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Notre Mission</h2>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel. 
              Nous croyons que l'accès à une information de qualité est un droit fondamental et un moteur essentiel 
              pour le développement du continent.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="font-heading text-3xl font-bold mb-8">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Link
                  key={value.title}
                  href={value.href || '#'}
                  className="bg-card rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                  {value.href && (
                    <div className="mt-4 inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm">
                      En savoir plus
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold">Notre Équipe</h2>
            <Link
              href="/a-propos/equipe"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Voir toute l'équipe
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden">
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
                  <p className="text-sm text-muted-foreground">{member.background}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Charter Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold">Notre Charte Éthique</h2>
            <Link
              href="/a-propos/charte"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Lire la charte complète
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="bg-card rounded-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Engagements Éthiques</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charterPoints.map((point) => (
                <div key={point.title} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-2">{point.title}</h4>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Rejoignez-nous</h2>
          <p className="text-xl text-gray-200 mb-8">
            Vous partagez notre vision ? Découvrez comment vous pouvez contribuer à notre mission.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/nous-soutenir"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Nous soutenir
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
