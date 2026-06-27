'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Building, Users, Heart, Send, CheckCircle } from 'lucide-react';

export default function PartenariatsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    partnershipType: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', company: '', partnershipType: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const partnershipTypes = [
    {
      icon: Building,
      title: 'Partenariat Commercial',
      description: 'Collaborations publicitaires, sponsoring et placements de marque.',
      color: 'bg-primary',
    },
    {
      icon: Users,
      title: 'Partenariat Média',
      description: 'Échanges de contenu, diffusion croisée et co-production.',
      color: 'bg-accent',
    },
    {
      icon: Heart,
      title: 'Partenariat Institutionnel',
      description: 'Collaborations avec ONG, institutions gouvernementales et organisations internationales.',
      color: 'bg-secondary',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-5xl font-bold mb-4">Partenariats</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Ensemble, construisons l\'avenir de l\'information africaine. Découvrez nos opportunités de collaboration.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-8">Nos types de partenariats</h2>
            <div className="space-y-6">
              {partnershipTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                          {type.title}
                        </h3>
                        <p className="text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8">
              <h3 className="font-heading text-2xl font-bold mb-4">Pourquoi nous choisir ?</h3>
              <ul className="space-y-3">
                {[
                  'Audience de plus de 2 millions de visiteurs mensuels',
                  'Couverture de 54 pays africains',
                  'Contenu de haute qualité et indépendant',
                  'Engagement fort avec notre communauté',
                  'Innovation dans le journalisme numérique',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold mb-8">Contactez-nous</h2>
            
            {isSubmitted ? (
              <div className="bg-card rounded-xl p-8 text-center border-2 border-green-500">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
                  Message envoyé !
                </h3>
                <p className="text-muted-foreground">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                      Entreprise / Organisation *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      placeholder="Nom de votre organisation"
                    />
                  </div>

                  <div>
                    <label htmlFor="partnershipType" className="block text-sm font-medium text-foreground mb-2">
                      Type de partenariat souhaité *
                    </label>
                    <select
                      id="partnershipType"
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="commercial">Partenariat Commercial</option>
                      <option value="media">Partenariat Média</option>
                      <option value="institutional">Partenariat Institutionnel</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Votre message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
                      placeholder="Décrivez votre projet de partenariat..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
                  >
                    <Send className="w-5 h-5" />
                    Envoyer ma demande
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">partenariats@malakin.info</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium text-foreground">+243 123 456 789</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium text-foreground">Kinshasa, RDC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
