'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Share2 } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';

  const sections = [
    {
      title: 'Actualités',
      links: [
        { name: 'Politique', href: `/${locale}/actualites/politique` },
        { name: 'Économie', href: `/${locale}/actualites/economie` },
        { name: 'Société', href: `/${locale}/actualites/societe` },
        { name: 'Santé', href: `/${locale}/actualites/sante` },
        { name: 'Sécurité', href: `/${locale}/actualites/securite` },
        { name: 'Environnement', href: `/${locale}/actualites/environnement` },
      ],
    },
    {
      title: 'Rubriques',
      links: [
        { name: 'Médias', href: `/${locale}/medias` },
        { name: 'Religion', href: `/${locale}/religion` },
        { name: 'Culture', href: `/${locale}/culture` },
        { name: 'Sport', href: `/${locale}/sport` },
        { name: 'Emploi', href: `/${locale}/emploi` },
        { name: 'Blog', href: `/${locale}/blog` },
      ],
    },
    {
      title: 'Plus',
      links: [
        { name: 'Communiqués', href: `/${locale}/communiques` },
        { name: 'Infos Pratiques', href: `/${locale}/infos-pratiques` },
        { name: 'Science & Tech', href: `/${locale}/science-tech` },
        { name: 'Partenariats', href: `/${locale}/partenariats` },
        { name: 'Recherche', href: `/${locale}/recherche` },
      ],
    },
    {
      title: 'À propos',
      links: [
        { name: 'Notre Mission', href: `/${locale}/a-propos/mission` },
        { name: 'Notre Équipe', href: `/${locale}/a-propos/equipe` },
        { name: 'Charte Éthique', href: `/${locale}/a-propos/charte` },
        { name: 'Contact', href: `/${locale}/contact` },
        { name: 'Nous Soutenir', href: `/${locale}/nous-soutenir` },
      ],
    },
    {
      title: 'Légal',
      links: [
        { name: 'Mentions Légales', href: `/${locale}/mentions-legales` },
        { name: 'Politique de Confidentialité', href: `/${locale}/politique-confidentialite` },
        { name: 'Conditions d\'Utilisation', href: `/${locale}/conditions-utilisation` },
        { name: 'Cookies', href: `/${locale}/cookies` },
      ],
    },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">M</span>
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-white">Malakin</span>
                <span className="font-heading font-bold text-xl text-accent">.info</span>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              L'info qui traverse les frontières. Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-heading font-semibold text-lg text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>contact@malakin.info</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+243 000 000 000</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Kinshasa, République Démocratique du Congo</span>
              </div>
            </div>
            <div className="text-sm text-gray-300 text-right">
              <p>© {currentYear} Malakin.info. Tous droits réservés.</p>
              <p className="mt-1">Fait avec ❤️ pour l'Afrique</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
