import Link from 'next/link';
import { ArrowRight, Heart, Handshake, Award, MessageSquare } from 'lucide-react';

export default function NousSoutenirPage() {
  const categories = [
    { name: 'Faire un Don', href: '/nous-soutenir/faire-un-don', icon: Heart, count: 0 },
    { name: 'Partenariats', href: '/nous-soutenir/partenariats', icon: Handshake, count: 0 },
    { name: 'Mécénat', href: '/nous-soutenir/mecenat', icon: Award, count: 0 },
    { name: 'Pourquoi Soutenir', href: '/nous-soutenir/pourquoi-soutenir', icon: MessageSquare, count: 0 },
    { name: 'Témoignages', href: '/nous-soutenir/temoignages-donateurs', icon: MessageSquare, count: 15 },
  ];

  const impactStats = [
    { value: '5M+', label: 'Lecteurs mensuels' },
    { value: '50+', label: 'Pays couverts' },
    { value: '100+', label: 'Journalistes' },
    { value: '10+', label: 'Années d\'existence' },
  ];

  const donationOptions = [
    {
      id: 1,
      amount: '10€',
      impact: 'Finance 1 article d\'actualité',
      popular: false,
    },
    {
      id: 2,
      amount: '25€',
      impact: 'Soutient notre équipe éditoriale pendant 1 jour',
      popular: true,
    },
    {
      id: 3,
      amount: '50€',
      impact: 'Finance une enquête sur le terrain',
      popular: false,
    },
    {
      id: 4,
      amount: '100€',
      impact: 'Soutient notre mission pendant une semaine',
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Nous Soutenir</h1>
          <p className="text-xl text-gray-200">
            Contribuez à un journalisme indépendant et fiable en Afrique
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4">Options</h2>
              <ul className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <li key={category.name}>
                      <Link
                        href={category.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-12">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Notre impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-lg p-6 text-center">
                    <div className="font-heading text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Faire un don</h2>
              <p className="text-muted-foreground mb-6">
                Votre contribution nous permet de continuer à produire un journalisme de qualité, indépendant et accessible à tous.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donationOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`bg-card rounded-lg p-6 border-2 transition-all hover:shadow-md ${
                      option.popular ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {option.popular && (
                      <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full mb-3">
                        Populaire
                      </span>
                    )}
                    <div className="font-heading text-3xl font-bold text-foreground mb-2">
                      {option.amount}
                    </div>
                    <p className="text-muted-foreground mb-4">{option.impact}</p>
                    <Link
                      href="/nous-soutenir/faire-un-don"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Choisir ce montant
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Autres façons de nous soutenir</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/nous-soutenir/partenariats"
                  className="bg-card rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <Handshake className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">Partenariats</h3>
                  <p className="text-muted-foreground">
                    Devenez partenaire et associez votre image à notre mission.
                  </p>
                </Link>
                <Link
                  href="/nous-soutenir/mecenat"
                  className="bg-card rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <Award className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">Mécénat</h3>
                  <p className="text-muted-foreground">
                    Soutenez nos projets spéciaux et nos enquêtes d'envergure.
                  </p>
                </Link>
                <Link
                  href="/nous-soutenir/pourquoi-soutenir"
                  className="bg-card rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <MessageSquare className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">Pourquoi nous soutenir</h3>
                  <p className="text-muted-foreground">
                    Découvrez comment votre don fait une différence réelle.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
