'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';

// Données de démonstration pour la recherche - base de données complète
const mockResults = [
  // Actualités
  {
    id: 1,
    title: 'Sommet de l\'Union Africaine : Les dirigeants s\'engagent pour une intégration économique renforcée',
    excerpt: 'Les chefs d\'État africains ont adopté une déclaration historique visant à faciliter les échanges commerciaux intra-africains.',
    category: 'Politique',
    href: '/actualites/politique/1',
    date: '27 Juin 2026',
    readTime: '5 min',
    keywords: ['union africaine', 'intégration', 'économie', 'commerce', 'sommet', 'dirigeants'],
  },
  {
    id: 2,
    title: 'Le secteur technologique africain attire 2 milliards de dollars d\'investissements',
    excerpt: 'Les startups africaines continuent de séduire les investisseurs internationaux malgré le contexte économique mondial.',
    category: 'Économie',
    href: '/actualites/economie/1',
    date: '26 Juin 2026',
    readTime: '4 min',
    keywords: ['technologie', 'startup', 'investissement', 'dollar', 'économie', 'innovation'],
  },
  {
    id: 3,
    title: 'Festival de cinéma africain : Les talents locaux à l\'honneur',
    excerpt: 'Le festival met en lumière les créateurs africains et leur contribution à l\'industrie cinématographique mondiale.',
    category: 'Société',
    href: '/actualites/societe/1',
    date: '27 Juin 2026',
    readTime: '3 min',
    keywords: ['cinéma', 'festival', 'culture', 'talent', 'afrique', 'film'],
  },
  {
    id: 4,
    title: 'Nouvelle initiative de vaccination contre le paludisme en Afrique centrale',
    excerpt: 'L\'OMS lance un programme massif de vaccination dans cinq pays de la région pour réduire la mortalité infantile.',
    category: 'Santé',
    href: '/actualites/sante/1',
    date: '25 Juin 2026',
    readTime: '6 min',
    keywords: ['vaccination', 'paludisme', 'santé', 'oms', 'enfants', 'mortalité'],
  },
  // Religion
  {
    id: 5,
    title: 'Méditation du jour : La paix intérieure',
    excerpt: 'Un moment de calme et de réflexion pour trouver la paix au milieu des tumultes de la vie.',
    category: 'Religion',
    href: '/religion/meditations/1',
    date: '27 Juin 2026',
    readTime: '5 min',
    keywords: ['méditation', 'paix', 'calme', 'réflexion', 'spiritualité', 'foi'],
  },
  {
    id: 6,
    title: 'Homélie : L\'importance de la prière dans la vie quotidienne',
    excerpt: 'Réflexion sur le rôle central de la prière pour nourrir notre foi et notre relation avec Dieu.',
    category: 'Religion',
    href: '/religion/homelies/1',
    date: '26 Juin 2026',
    readTime: '8 min',
    keywords: ['homélie', 'prière', 'foi', 'dieu', 'spiritualité', 'vie quotidienne'],
  },
  {
    id: 7,
    title: 'William Branham : Sermon sur la Venue du Messie',
    excerpt: 'Message prophétique sur la venue du Seigneur et la fin des temps.',
    category: 'Religion',
    href: '/religion/message-du-temps/branham/sermons/1',
    date: '25 Décembre 1965',
    readTime: '15 min',
    keywords: ['branham', 'sermon', 'messie', 'prophétie', 'fin des temps', 'message'],
  },
  // Sport
  {
    id: 8,
    title: 'CAN 2027 : La RDC finalise ses préparatifs',
    excerpt: 'Les stades sont prêts, les infrastructures sont en place : la RDC est prête pour la Coupe d\'Afrique des Nations.',
    category: 'Sport',
    href: '/sport/football/1',
    date: '27 Juin 2026',
    readTime: '6 min',
    keywords: ['can', 'rdc', 'football', 'stade', 'préparatifs', 'coupe afrique'],
  },
  {
    id: 9,
    title: 'BAL : Les clubs africains en progression',
    excerpt: 'La Basketball Africa League continue de gagner en popularité et en qualité.',
    category: 'Sport',
    href: '/sport/basket/1',
    date: '26 Juin 2026',
    readTime: '5 min',
    keywords: ['bal', 'basketball', 'afrique', 'club', 'progression', 'sport'],
  },
  // Culture
  {
    id: 10,
    title: 'Le gospel africain conquiert le monde',
    excerpt: 'Comment les chorales et artistes gospel africains s\'exportent avec succès sur la scène internationale.',
    category: 'Culture',
    href: '/culture/musique/1',
    date: '27 Juin 2026',
    readTime: '6 min',
    keywords: ['gospel', 'musique', 'chorale', 'artiste', 'international', 'afrique'],
  },
  {
    id: 11,
    title: 'Nollywood : L\'industrie du cinéma nigérian en pleine expansion',
    excerpt: 'Analyse de la croissance de Nollywood et de son impact sur l\'économie africaine.',
    category: 'Culture',
    href: '/culture/cinema/1',
    date: '26 Juin 2026',
    readTime: '7 min',
    keywords: ['nollywood', 'cinéma', 'nigeria', 'industrie', 'économie', 'film'],
  },
  // Médias
  {
    id: 12,
    title: 'Galerie : Festival des arts de Kinshasa 2026',
    excerpt: 'Les plus belles images du festival qui a rassemblé des artistes de tout le continent.',
    category: 'Médias',
    href: '/medias/photos/1',
    date: '26 Juin 2026',
    readTime: '3 min',
    keywords: ['galerie', 'photo', 'festival', 'kinshasa', 'arts', 'image'],
  },
  {
    id: 13,
    title: 'Reportage exclusif : Le quotidien des entrepreneurs africains',
    excerpt: 'Découvrez les défis et les succès des startups qui transforment le continent.',
    category: 'Médias',
    href: '/medias/videos/1',
    date: '27 Juin 2026',
    readTime: '12 min',
    keywords: ['reportage', 'vidéo', 'entrepreneur', 'startup', 'succès', 'défis'],
  },
  // Blog
  {
    id: 14,
    title: 'L\'avenir du journalisme en Afrique à l\'ère numérique',
    excerpt: 'Analyse des défis et des opportunités pour la presse africaine face à la transformation numérique.',
    category: 'Blog',
    href: '/blog/tribunes/1',
    date: '27 Juin 2026',
    readTime: '8 min',
    keywords: ['journalisme', 'numérique', 'presse', 'afrique', 'transformation', 'médias'],
  },
  {
    id: 15,
    title: 'Chronique culturelle : La renaissance de l\'art africain',
    excerpt: 'Comment les artistes contemporains réinventent les traditions et créent de nouveaux courants.',
    category: 'Blog',
    href: '/blog/chroniques/1',
    date: '26 Juin 2026',
    readTime: '6 min',
    keywords: ['chronique', 'art', 'culture', 'renaissance', 'tradition', 'contemporain'],
  },
  // Emploi
  {
    id: 16,
    title: 'Médecin généraliste',
    excerpt: 'Hôpital Central de Kinshasa recherche un médecin généraliste pour rejoindre son équipe médicale.',
    category: 'Emploi',
    href: '/emploi/offres/sante/1',
    date: '27 Juin 2026',
    readTime: '2 min',
    keywords: ['médecin', 'emploi', 'santé', 'hôpital', 'kinshasa', 'recrutement'],
  },
  {
    id: 17,
    title: 'Comment rédiger un CV efficace pour le marché africain',
    excerpt: 'Conseils pratiques pour adapter votre CV aux attentes des recruteurs africains.',
    category: 'Emploi',
    href: '/emploi/conseils-carriere/1',
    date: '26 Juin 2026',
    readTime: '8 min',
    keywords: ['cv', 'conseil', 'carrière', 'recrutement', 'marché', 'africain'],
  },
  // Science & Tech
  {
    id: 18,
    title: 'Introduction aux bases de données relationnelles',
    excerpt: 'Guide complet pour comprendre les fondamentaux des bases de données relationnelles et SQL.',
    category: 'Science & Tech',
    href: '/science-tech/base-de-donnees/1',
    date: '27 Juin 2026',
    readTime: '12 min',
    keywords: ['base de données', 'sql', 'relationnel', 'guide', 'tutoriel', 'données'],
  },
  {
    id: 19,
    title: 'L\'analyse de données au service du développement africain',
    excerpt: 'Comment la data science peut contribuer au développement économique et social du continent.',
    category: 'Science & Tech',
    href: '/science-tech/analyse-de-donnees/1',
    date: '26 Juin 2026',
    readTime: '10 min',
    keywords: ['analyse de données', 'data science', 'développement', 'africain', 'économie', 'social'],
  },
  {
    id: 20,
    title: 'La géographie de l\'Afrique : Un continent aux multiples facettes',
    excerpt: 'Découverte des paysages, climats et écosystèmes qui font la richesse naturelle de l\'Afrique.',
    category: 'Science & Tech',
    href: '/science-tech/nature-environnement/1',
    date: '25 Juin 2026',
    readTime: '15 min',
    keywords: ['géographie', 'afrique', 'paysage', 'climat', 'écosystème', 'nature'],
  },
  // Infos Pratiques
  {
    id: 21,
    title: 'Guide complet pour créer une entreprise en RDC',
    excerpt: 'Toutes les étapes et démarches administratives pour lancer votre activité.',
    category: 'Infos Pratiques',
    href: '/infos-pratiques/guides/1',
    date: '26 Juin 2026',
    readTime: '15 min',
    keywords: ['guide', 'entreprise', 'rdc', 'démarche', 'administratif', 'création'],
  },
  // Communiqués
  {
    id: 22,
    title: 'Lancement du programme national de vaccination 2026-2030',
    excerpt: 'Le gouvernement annonce un plan ambitieux pour améliorer la couverture vaccinale dans tout le pays.',
    category: 'Communiqués',
    href: '/communiques/gouvernement/1',
    date: '27 Juin 2026',
    readTime: '4 min',
    keywords: ['vaccination', 'gouvernement', 'programme', 'santé', 'plan', 'national'],
  },
  // À Propos
  {
    id: 23,
    title: 'Notre Mission',
    excerpt: 'Informer, éduquer et connecter l\'Afrique à travers un journalisme indépendant, fiable et multiculturel.',
    category: 'À Propos',
    href: '/a-propos/mission',
    date: 'Permanent',
    readTime: '5 min',
    keywords: ['mission', 'journalisme', 'indépendant', 'afrique', 'information', 'éducation'],
  },
  {
    id: 24,
    title: 'Notre Équipe',
    excerpt: 'Découvrez les professionnels qui font de Malakin.info une référence de l\'information africaine.',
    category: 'À Propos',
    href: '/a-propos/equipe',
    date: 'Permanent',
    readTime: '3 min',
    keywords: ['équipe', 'professionnel', 'journaliste', 'rédacteur', 'collaborateur', 'staff'],
  },
];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(mockResults);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      // Simulation d'une recherche avec algorithme amélioré
      setTimeout(() => {
        const searchTerms = query.toLowerCase().split(' ').filter((term: string) => term.length > 0);
        
        const filtered = mockResults.filter((item) => {
          const searchableText = [
            item.title,
            item.excerpt,
            item.category,
            ...(item.keywords || [])
          ].join(' ').toLowerCase();
          
          // Recherche exacte (tous les termes présents)
          const exactMatch = searchTerms.every((term: string) => 
            searchableText.includes(term)
          );
          
          // Recherche partielle (au moins un terme présent)
          const partialMatch = searchTerms.some((term: string) => 
            searchableText.includes(term)
          );
          
          return exactMatch || partialMatch;
        });
        
        // Trier par pertinence (nombre de termes correspondants)
        const sorted = filtered.sort((a, b) => {
          const aScore = searchTerms.filter((term: string) => 
            [a.title, a.excerpt, a.category, ...(a.keywords || [])]
              .join(' ').toLowerCase().includes(term)
          ).length;
          const bScore = searchTerms.filter((term: string) => 
            [b.title, b.excerpt, b.category, ...(b.keywords || [])]
              .join(' ').toLowerCase().includes(term)
          ).length;
          return bScore - aScore;
        });
        
        setResults(sorted);
        setIsLoading(false);
      }, 300);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            defaultValue={query}
            placeholder="Rechercher des articles, des vidéos, des actualités..."
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Recherche en cours...</p>
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Aucun résultat pour "{query}"
          </h2>
          <p className="text-muted-foreground mb-6">
            Essayez avec d'autres mots-clés ou explorez nos catégories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Politique', 'Économie', 'Sport', 'Culture', 'Religion'].map((category) => (
              <a
                key={category}
                href={`/?category=${category.toLowerCase()}`}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      ) : !query ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
            Que recherchez-vous ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entrez un mot-clé pour trouver des articles, des vidéos et plus encore
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-6">
            {results.map((result) => (
              <article
                key={result.id}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {result.category}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {result.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {result.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {result.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.readTime}
                    </span>
                  </div>
                  <a
                    href={result.href}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    Lire la suite
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
