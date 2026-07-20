'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Smartphone, CheckCircle, Heart, ArrowLeft, Shield } from 'lucide-react';

export default function FaireUnDonPage() {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presetAmounts = ['5000', '10000', '25000', '50000', '100000'];

  const paymentMethods = [
    {
      id: 'orange-money',
      name: 'Orange Money',
      icon: '🟠',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500',
    },
    {
      id: 'airtel-money',
      name: 'Airtel Money',
      icon: '🔴',
      color: 'bg-red-500',
      borderColor: 'border-red-500',
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '🟢',
      color: 'bg-green-500',
      borderColor: 'border-green-500',
    },
    {
      id: 'card',
      name: 'Carte Prépayée',
      icon: '💳',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
    },
  ];

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulation de traitement du paiement
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const finalAmount = selectedAmount || customAmount;

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/nous-soutenir" className="text-gray-300 hover:text-white mb-4 inline-block">
              ← Retour à Nous Soutenir
            </Link>
            <h1 className="font-heading text-4xl font-bold mb-4">Faire un Don</h1>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card rounded-xl p-8 text-center border-2 border-green-500">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Merci pour votre don !
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              Montant : {finalAmount} FCFA
            </p>
            <p className="text-muted-foreground mb-8">
              Votre contribution nous aide à continuer notre mission d'information indépendante en Afrique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedAmount('');
                  setCustomAmount('');
                  setPaymentMethod('');
                  setPhoneNumber('');
                  setCardNumber('');
                  setCardName('');
                  setCardExpiry('');
                  setCardCvv('');
                }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Faire un autre don
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/nous-soutenir" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Nous Soutenir
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Faire un Don</h1>
          <p className="text-xl text-gray-200">
            Soutenez le journalisme indépendant africain
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-primary" />
                <h2 className="font-heading text-2xl font-bold">Pourquoi donner ?</h2>
              </div>
              <ul className="space-y-3">
                {[
                  'Soutenir un journalisme indépendant',
                  'Contribuer à l\'information de qualité',
                  'Aider à couvrir les coûts de production',
                  'Permettre le développement de nouvelles rubriques',
                  'Soutenir nos enquêtes et reportages',
                ].map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="font-heading text-lg font-semibold">Paiement sécurisé</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Vos transactions sont sécurisées. Nous utilisons les protocoles de sécurité les plus récents pour protéger vos informations.
              </p>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold mb-6">Votre don</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Montant du don (FCFA)
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                        selectedAmount === amount
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50 bg-background text-foreground'
                      }`}
                    >
                      {parseInt(amount).toLocaleString()} FCFA
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  placeholder="Autre montant"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === method.id
                          ? `${method.borderColor} ${method.color} text-white`
                          : 'border-border hover:border-primary/50 bg-background text-foreground'
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Numéro de carte
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nom sur la carte
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="JEAN DUPONT"
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Expiration
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Numéro de téléphone
                      </label>
                      <div className="flex gap-2">
                        <select className="px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                          <option value="+243">+243 (RDC)</option>
                          <option value="+225">+225 (CI)</option>
                          <option value="+221">+221 (SN)</option>
                          <option value="+234">+234 (NG)</option>
                          <option value="+254">+254 (KE)</option>
                        </select>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="XX XX XX XX"
                          className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Vous recevrez un code de confirmation sur votre téléphone pour valider le paiement.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!finalAmount || !paymentMethod || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Faire un don de {finalAmount ? parseInt(finalAmount).toLocaleString() : '0'} FCFA
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                En faisant un don, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
