'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Handshake, Sparkles, Target, Users, Globe, Zap, Mail, ArrowRight, Building2, TrendingUp, Award, CheckCircle2, Send, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react';

export default function PartenariatsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipType: '',
    message: '',
    budget: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [locale, setLocale] = useState('fr');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);

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
    form: {
      title: isFrench ? 'Démarrer votre partenariat' : 'Start your partnership',
      subtitle: isFrench 
        ? 'Remplissez ce formulaire et notre équipe vous contactera sous 48h' 
        : 'Fill out this form and our team will contact you within 48 hours',
      fields: {
        companyName: isFrench ? 'Nom de l\'entreprise' : 'Company name',
        contactName: isFrench ? 'Nom du contact' : 'Contact name',
        email: isFrench ? 'Email professionnel' : 'Professional email',
        phone: isFrench ? 'Téléphone' : 'Phone',
        partnershipType: isFrench ? 'Type de partenariat' : 'Partnership type',
        budget: isFrench ? 'Budget estimé' : 'Estimated budget',
        timeline: isFrench ? 'Délai souhaité' : 'Desired timeline',
        message: isFrench ? 'Votre message' : 'Your message'
      },
      options: {
        partnershipType: [
          { value: 'advertising', label: isFrench ? 'Publicité & Sponsorship' : 'Advertising & Sponsorship' },
          { value: 'editorial', label: isFrench ? 'Partenariats Éditoriaux' : 'Editorial Partnerships' },
          { value: 'digital', label: isFrench ? 'Solutions Digitales' : 'Digital Solutions' },
          { value: 'institutional', label: isFrench ? 'Partenariats Institutionnels' : 'Institutional Partnerships' }
        ],
        budget: [
          { value: '1000-5000', label: '$1,000 - $5,000' },
          { value: '5000-10000', label: '$5,000 - $10,000' },
          { value: '10000-25000', label: '$10,000 - $25,000' },
          { value: '25000+', label: isFrench ? '$25,000+' : '$25,000+' }
        ],
        timeline: [
          { value: 'immediate', label: isFrench ? 'Immédiat' : 'Immediate' },
          { value: '1-3months', label: isFrench ? '1-3 mois' : '1-3 months' },
          { value: '3-6months', label: isFrench ? '3-6 mois' : '3-6 months' },
          { value: '6months+', label: isFrench ? '6+ mois' : '6+ months' }
        ]
      },
      submit: isFrench ? 'Envoyer la demande' : 'Submit request',
      success: isFrench 
        ? 'Votre demande a été envoyée avec succès ! Un email de confirmation vous a été envoyé. Notre équipe vous contactera dans un délai de 48 à 72 heures.' 
        : 'Your request has been sent successfully! A confirmation email has been sent to you. Our team will contact you within 48 to 72 hours.',
      error: isFrench 
        ? 'Une erreur est survenue. Veuillez réessayer.' 
        : 'An error occurred. Please try again.'
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          partnershipType: '',
          message: '',
          budget: '',
          timeline: ''
        });
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.message || content.form.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(content.form.error);
    } finally {
      setIsSubmitting(false);
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

      {/* CTA Button Section */}
      {!showForm && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b3b8b] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#082a63] shadow-lg hover:shadow-xl"
            >
              {content.form.title}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-sm text-slate-600">
              {content.form.subtitle}
            </p>
          </div>
        </section>
      )}

      {/* Form Section */}
      {showForm && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-[#e1e4e8] bg-white p-8 sm:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-black text-[#081c3d] sm:text-4xl mb-4">
                {content.form.title}
              </h2>
              <p className="text-lg text-slate-600">
                {content.form.subtitle}
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{content.form.success}</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.companyName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 pl-10 pr-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                      placeholder={isFrench ? 'Votre entreprise' : 'Your company'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.contactName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 pl-10 pr-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                      placeholder={isFrench ? 'Votre nom' : 'Your name'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.email} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 pl-10 pr-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.phone}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 pl-10 pr-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                      placeholder="+243 000 000 000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.partnershipType} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="partnershipType"
                    value={formData.partnershipType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 px-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                  >
                    <option value="">{isFrench ? 'Sélectionnez...' : 'Select...'}</option>
                    {content.form.options.partnershipType.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#081c3d] mb-2">
                    {content.form.fields.budget}
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 px-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                  >
                    <option value="">{isFrench ? 'Sélectionnez...' : 'Select...'}</option>
                    {content.form.options.budget.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#081c3d] mb-2">
                  {content.form.fields.timeline}
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 px-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10"
                >
                  <option value="">{isFrench ? 'Sélectionnez...' : 'Select...'}</option>
                  {content.form.options.timeline.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#081c3d] mb-2">
                  {content.form.fields.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-[#e1e4e8] bg-white py-3 px-4 text-sm text-[#081c3d] outline-none transition focus:border-[#0b3b8b] focus:ring-2 focus:ring-[#0b3b8b]/10 resize-none"
                  placeholder={isFrench ? 'Décrivez votre projet de partenariat...' : 'Describe your partnership project...'}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b3b8b] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#082a63] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isFrench ? 'Envoi en cours...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    {content.form.submit}
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#e1e4e8]">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>partnerships@malakinfo.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+243 000 000 000</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Kinshasa, RDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
