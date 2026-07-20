'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <footer className="bg-black text-white">
      {/* Red accent bar */}
      <div className="h-1 bg-red-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Dans l'actualité + Rubriques */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">DANS L'ACTUALITÉ</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/actualites/politique`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    Politique
                  </Link>
                  <Link href={`/${locale}/actualites/economie`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    Économie
                  </Link>
                </div>
                <Link href={`/${locale}/actualites`} className="border border-white text-white px-3 py-2 text-xs text-center block hover:bg-white hover:text-black transition-colors">
                  Actualités Africaines 2026
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/actualites/societe`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    Société
                  </Link>
                  <Link href={`/${locale}/actualites/sante`} className="border border-white text-white px-3 py-2 text-xs text-center hover:bg-white hover:text-black transition-colors">
                    Santé
                  </Link>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">RUBRIQUES</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Link href={`/${locale}/actualites/securite`} className="text-gray-300 hover:text-white block">Sécurité</Link>
                  <Link href={`/${locale}/actualites/environnement`} className="text-gray-300 hover:text-white block">Environnement</Link>
                  <Link href={`/${locale}/culture`} className="text-gray-300 hover:text-white block">Culture</Link>
                </div>
                <div className="space-y-1">
                  <Link href={`/${locale}/sport`} className="text-gray-300 hover:text-white block">Sport</Link>
                  <Link href={`/${locale}/emploi`} className="text-gray-300 hover:text-white block">Emploi</Link>
                  <Link href={`/${locale}/blog`} className="text-gray-300 hover:text-white block">Blog</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: À propos de Malakin */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide">À PROPOS DE MALAKIN</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Link href={`/${locale}/a-propos`} className="text-gray-300 hover:text-white block">Qui sommes-nous ?</Link>
                <Link href={`/${locale}/a-propos/mission`} className="text-gray-300 hover:text-white block">Notre Mission</Link>
                <Link href={`/${locale}/a-propos/equipe`} className="text-gray-300 hover:text-white block">Notre Équipe</Link>
              </div>
              <div className="space-y-1">
                <Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white block">Contact</Link>
                <Link href={`/${locale}/partenariats`} className="text-gray-300 hover:text-white block">Publicité</Link>
                <Link href={`/${locale}/nous-soutenir`} className="text-gray-300 hover:text-white block">Nous Soutenir</Link>
              </div>
            </div>
          </div>

          {/* Column 3: Réseau Malakin Media */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide">RÉSEAU MALAKIN MEDIA</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Link href="#" className="text-gray-300 hover:text-white block">Malakin Radio Afrique</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">Focus Éco</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">Tribune Jeunesse</Link>
              </div>
              <div className="space-y-1">
                <Link href="#" className="text-gray-300 hover:text-white block">Malakin Docu</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">Observatoire Média</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">Partenariats</Link>
              </div>
            </div>
          </div>

          {/* Column 4: Services + Applications */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">SERVICES</h3>
              <div className="space-y-1 text-xs">
                <Link href="#" className="text-gray-300 hover:text-white block">Newsletters</Link>
                <Link href="#" className="text-gray-300 hover:text-white block">Flux RSS</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4 text-sm tracking-wide">APPLICATIONS</h3>
              <p className="text-xs text-gray-300 mb-3">Télécharger l'app Malakin.info sur mobile et tablette</p>
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">F24</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">MCD</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">FMM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-gray-700 mt-8 pt-4 mb-4">
          <div className="flex flex-wrap gap-4 text-xs text-gray-300">
            <Link href={`/${locale}/mentions-legales`} className="hover:text-white">Mentions Légales</Link>
            <Link href={`/${locale}/politique-confidentialite`} className="hover:text-white">Politique de Confidentialité</Link>
            <Link href={`/${locale}/conditions-utilisation`} className="hover:text-white">Conditions d'Utilisation</Link>
            <Link href={`/${locale}/cookies`} className="hover:text-white">Cookies</Link>
            <Link href="#" className="hover:text-white">Notifications</Link>
          </div>
        </div>

        {/* Social media bar */}
        <div className="border-t border-gray-700 pt-4 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Facebook</span>
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Bluesky</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Threads</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">YouTube</span>
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">TikTok</span>
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Telegram</span>
            </div>
            
            <div className="border-l border-gray-700 pl-4 ml-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">contact@malakin.info</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">+243 000 000 000</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hover:text-white cursor-pointer">Kinshasa, République Démocratique du Congo</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400 text-right">
          <p>© {currentYear} Malakin.info. Tous droits réservés. | Fait avec ❤️ pour l'Afrique</p>
        </div>
      </div>
    </footer>
  );
}
