'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { Send, Loader2 } from 'lucide-react';

const interestOptions = [
  { label: 'Actualités', value: 'actualites' },
  { label: 'Économie', value: 'economie' },
  { label: 'Culture', value: 'culture' },
  { label: 'Sport', value: 'sport' },
  { label: 'Science & Tech', value: 'tech' },
];

export default function NewsletterSendPage() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          html: content,
          text: content,
          filter: {
            activeOnly: true,
            interests: selectedInterests,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({ type: 'success', message: `Email envoyé à ${data.count} abonnés.` });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur d’envoi.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erreur réseau lors de l’envoi.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Envoyer une newsletter</h1>
          <p className="text-secondary mt-1">Rédigez un message personnalisé et envoyez-le à tous les abonnés actifs.</p>
        </div>

        {status && (
          <div className={`rounded-lg p-4 ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border p-6 shadow-sm">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Objet</label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
            <WordEditor content={content} onChange={setContent} />
            <p className="text-xs text-gray-500 mt-2">Utilisez <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> pour personnaliser le message.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cibler par centres d'intérêt</label>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:border-primary">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedInterests.includes(option.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedInterests((current) =>
                        current.includes(value)
                          ? current.filter((item) => item !== value)
                          : [...current, value]
                      );
                    }}
                    className="h-4 w-4 text-primary rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Laissez vide pour envoyer à tous les abonnés actifs.</p>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</> : <><Send className="h-4 w-4" /> Envoyer la newsletter</>}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
