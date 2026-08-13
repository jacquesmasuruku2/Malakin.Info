'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Calendar, DollarSign, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DonationsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const { data: session, status } = useSession();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchDonations();
    }
  }, [session]);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/user/donations');
      
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  };

  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mes dons</h1>
            <p className="text-muted-foreground">Historique de vos contributions</p>
          </div>
          <a
            href={`/${locale}/nous-soutenir`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Faire un don
          </a>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total donné</p>
              <p className="text-3xl font-bold">{totalDonated.toFixed(2)} €</p>
            </div>
            <Heart className="w-12 h-12 opacity-90" />
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun don</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore fait de don. Votre soutien nous aide à continuer notre travail.
            </p>
            <a
              href={`/${locale}/nous-soutenir`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Faire un don
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {donation.isAnonymous ? 'Don anonyme' : donation.donorName || 'Don'}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Number(donation.amount).toFixed(2)} {donation.currency}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      {getStatusIcon(donation.status)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(donation.status)}
                      </span>
                    </div>
                  </div>
                </div>
                {donation.message && (
                  <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                    "{donation.message}"
                  </p>
                )}
                {donation.paymentMethod && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Méthode de paiement: {donation.paymentMethod}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
