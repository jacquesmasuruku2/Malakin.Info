'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function NewsletterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string | null;
    const name = formData.get('name') as string | null;
    const interests = formData.getAll('interests').map((value) => String(value));
    const consent = formData.get('consent') === 'on';

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, interests, consent }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        e.currentTarget.reset();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'abonnement' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Restez informé
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour recevoir les dernières actualités, analyses et exclusivités directement dans votre boîte mail.
          </p>
        </div>
      </div>

      {/* Subscription Form Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Inscrivez-vous maintenant
          </h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="votre@email.com"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom (optionnel)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Votre nom"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Choisissez vos centres d'intérêt
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="interests" value="actualites" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" defaultChecked={!isSubmitting} disabled={isSubmitting} />
                  <span className="text-sm text-gray-700">Actualités</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="interests" value="economie" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" disabled={isSubmitting} />
                  <span className="text-sm text-gray-700">Économie</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="interests" value="culture" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" disabled={isSubmitting} />
                  <span className="text-sm text-gray-700">Culture</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="interests" value="sport" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" disabled={isSubmitting} />
                  <span className="text-sm text-gray-700">Sport</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="interests" value="tech" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" disabled={isSubmitting} />
                  <span className="text-sm text-gray-700">Science & Tech</span>
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                disabled={isSubmitting}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1 disabled:opacity-50"
              />
              <label htmlFor="consent" className="text-sm text-gray-600">
                J'accepte de recevoir des emails de MalakInfo.com et je comprends que je peux me désabonner à tout moment.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>S'abonner</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="font-heading text-2xl font-bold text-gray-900 mb-8 text-center">
          Pourquoi s'abonner ?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Contenu exclusif</h4>
            <p className="text-sm text-gray-600">
              Accédez à des articles et analyses que vous ne trouverez nulle part ailleurs.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Mises à jour quotidiennes</h4>
            <p className="text-sm text-gray-600">
              Recevez une sélection des meilleures actualités chaque matin directement dans votre boîte mail.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">100% gratuit</h4>
            <p className="text-sm text-gray-600">
              Notre newsletter est entièrement gratuite, sans spam ni publicités intrusives.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Nous respectons votre vie privée. Vos informations ne seront jamais partagées avec des tiers. 
            Consultez notre <a href="/politique-de-confidentialite" className="text-primary hover:underline">politique de confidentialité</a> pour en savoir plus.
          </p>
        </div>
      </div>
    </div>
  );
}
