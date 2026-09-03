import Link from 'next/link';
import { Handshake, Sparkles, Target, Users, Globe, Zap, Mail, ArrowRight, Building2, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

export default async function PartenariatsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
  const isFrench = locale === 'fr';

  const content = {
    hero: {
      title: isFrench ? 'Partenariats Stratégiques' : 'Strategic Partnerships',
      subtitle: isFrench 
        ? 'Construisons ensemble l\'avenir de l\'information africaine' 
        : 'Building the future of African information together',
      badge: isFrench ? 'Opportunités de collaboration' : 'Collaboration opportunities'
    },
    whyPartner: {
      title: isFrench ? 'Pourquoi devenir partenaire ?' : 'Why become a partner?',
      subtitle: isFrench 
        ? 'Rejoignez un écosystème média en pleine croissance en Afrique' 
        : 'Join a growing media ecosystem in Africa',
      reasons: [
        {
          icon: Users,
          title: isFrench ? 'Audience Qualifiée' : 'Qualified Audience',
          description: isFrench 
            ? 'Accès à une audience de plus de 2 millions de lecteurs actifs et engagés' 
            : 'Access to an audience of over 2 million active and engaged readers'
        },
        {
          icon: Globe,
          title: isFrench ? 'Couverture Pan-Africaine' : 'Pan-African Coverage',
          description: isFrench 
            ? 'Présence dans plus de 30 pays africains et diaspora mondiale' 
            : 'Presence in over 30 African countries and global diaspora'
        },
        {
          icon: TrendingUp,
          title: isFrench ? 'Croissance Rapide' : 'Rapid Growth',
          description: isFrench 
            ? 'Taux de croissance annuel de 45% et engagement exceptionnel' 
            : '45% annual growth rate and exceptional engagement'
        },
        {
          icon: Award,
          title: isFrench ? 'Crédibilité & Confiance' : 'Credibility & Trust',
          description: isFrench 
            ? 'Journalisme de haute qualité reconnu pour son intégrité' 
            : 'High-quality journalism recognized for its integrity'
        }
      ]
    },
    partnershipTypes: {
      title: isFrench ? 'Types de Partenariats' : 'Partnership Types',
      subtitle: isFrench 
        ? 'Des solutions adaptées à vos objectifs commerciaux' 
        : 'Solutions tailored to your business objectives',
      types: [
        {
          icon: Building2,
          title: isFrench ? 'Publicité & Sponsorship' : 'Advertising & Sponsorship',
          description: isFrench 
            ? 'Formats publicitaires premium, sponsoring de contenus et campagnes sur mesure' 
            : 'Premium ad formats, content sponsorship, and custom campaigns',
          features: [
            isFrench ? 'Bannières display et natives' : 'Display and native banners',
            isFrench ? 'Articles sponsorisés et advertorials' : 'Sponsored articles and advertorials',
            isFrench ? 'Vidéos publicitaires' : 'Video advertisements',
            isFrench ? 'Campagnes par email' : 'Email campaigns'
          ]
        },
        {
          icon: Target,
          title: isFrench ? 'Partenariats Éditoriaux' : 'Editorial Partnerships',
          description: isFrench 
            ? 'Collaborations de fond, dossiers thématiques et événements exclusifs' 
            : 'Deep collaborations, thematic dossiers, and exclusive events',
          features: [
            isFrench ? 'Dossiers spéciaux et enquêtes' : 'Special reports and investigations',
            isFrench ? 'Conférences et événements' : 'Conferences and events',
            isFrench ? 'Webinaires et podcasts' : 'Webinars and podcasts',
            isFrench ? 'Édition de livres blancs' : 'White paper publishing'
          ]
        },
        {
          icon: Zap,
          title: isFrench ? 'Solutions Digitales' : 'Digital Solutions',
          description: isFrench 
            ? 'Innovation technologique, produits digitaux et expériences immersives' 
            : 'Technological innovation, digital products, and immersive experiences',
          features: [
            isFrench ? 'Applications mobiles' : 'Mobile applications',
            isFrench ? 'Réalité virtuelle et augmentée' : 'Virtual and augmented reality',
            isFrench ? 'Plateformes de données' : 'Data platforms',
            isFrench ? 'Intelligence artificielle' : 'Artificial intelligence'
          ]
        },
        {
          icon: Handshake,
          title: isFrench ? 'Partenariats Institutionnels' : 'Institutional Partnerships',
          description: isFrench 
            ? 'Collaborations avec ONG, gouvernements et organisations internationales' 
            : 'Collaborations with NGOs, governments, and international organizations',
          features: [
            isFrench ? 'Projets de développement' : 'Development projects',
            isFrench ? 'Campagnes de sensibilisation' : 'Awareness campaigns',
            isFrench ? 'Formation et éducation' : 'Training and education',
            isFrench ? 'Échanges de connaissances' : 'Knowledge exchange'
          ]
        }
      ]
    },
    stats: {
      title: isFrench ? 'Nos chiffres clés' : 'Our key figures',
      items: [
        { value: '2M+', label: isFrench ? 'Lecteurs actifs' : 'Active readers' },
        { value: '30+', label: isFrench ? 'Pays couverts' : 'Countries covered' },
        { value: '45%', label: isFrench ? 'Croissance annuelle' : 'Annual growth' },
        { value: '85%', label: isFrench ? 'Taux d\'engagement' : 'Engagement rate' }
      ]
    },
    cta: {
      title: isFrench ? 'Prêt à collaborer ?' : 'Ready to collaborate?',
      subtitle: isFrench 
        ? 'Contactez notre équipe pour discuter de votre projet de partenariat' 
        : 'Contact our team to discuss your partnership project',
      buttonText: isFrench ? 'Démarrer la discussion' : 'Start the discussion'
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#081c3d] via-[#0b3b8b] to-[#1e5bb8] text-white">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
              <Sparkles className="h-4 w-4" />
              {content.hero.badge}
            </div>
            <h1 className="font-heading text-4xl font-black tracking-[-0.03em] sm:text-5xl lg:text-6xl mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl text-blue-100 sm:text-2xl">
              {content.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.stats.items.map((stat, index) => (
            <div key={index} className="rounded-2xl border border-[#e1e4e8] bg-white p-6 text-center shadow-sm">
              <div className="text-3xl font-black text-[#081c3d] sm:text-4xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl font-black text-[#081c3d] sm:text-4xl mb-4">
            {content.whyPartner.title}
          </h2>
          <p className="text-lg text-slate-600">
            {content.whyPartner.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {content.whyPartner.reasons.map((reason, index) => (
            <div key={index} className="rounded-2xl border border-[#e1e4e8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#0b3b8b]/10 p-3 text-[#0b3b8b]">
                  <reason.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-[#081c3d] mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-slate-600">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Types Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl font-black text-[#081c3d] sm:text-4xl mb-4">
            {content.partnershipTypes.title}
          </h2>
          <p className="text-lg text-slate-600">
            {content.partnershipTypes.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {content.partnershipTypes.types.map((type, index) => (
            <div key={index} className="rounded-2xl border border-[#e1e4e8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="rounded-xl bg-[#d4af37]/10 p-3 text-[#d4af37]">
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-[#081c3d] mb-2">
                    {type.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {type.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {type.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#0b3b8b] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-br from-[#081c3d] to-[#0b3b8b] p-8 sm:p-12 text-center text-white">
          <h2 className="font-heading text-3xl font-black sm:text-4xl mb-4">
            {content.cta.title}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {content.cta.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#081c3d] transition-colors hover:bg-[#c4a335]"
            >
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              href={`mailto:partnerships@malakinfo.com`}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/20"
            >
              <Mail className="h-4 w-4" />
              partnerships@malakinfo.com
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
