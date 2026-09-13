'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

type FormData = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  partnershipType: string;
  budget: string;
  timeline: string;
  message: string;
};

const emptyForm: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  partnershipType: '',
  budget: '',
  timeline: '',
  message: '',
};

export default function PartnershipRequestForm({ locale }: { locale: string }) {
  const isFrench = locale === 'fr';
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const labels = {
    companyName: isFrench ? 'Organisation' : 'Organization',
    contactName: isFrench ? 'Nom du contact' : 'Contact name',
    email: isFrench ? 'Email professionnel' : 'Work email',
    phone: isFrench ? 'Téléphone' : 'Phone',
    partnershipType: isFrench ? 'Type de partenariat' : 'Partnership type',
    budget: isFrench ? 'Budget estimé (facultatif)' : 'Estimated budget (optional)',
    timeline: isFrench ? 'Calendrier (facultatif)' : 'Timeline (optional)',
    message: isFrench ? 'Votre projet' : 'Your project',
    submit: isFrench ? 'Envoyer la demande' : 'Send request',
    sending: isFrench ? 'Envoi en cours...' : 'Sending...',
    success: isFrench
      ? 'Votre demande a bien été envoyée. Nous vous répondons généralement sous 48 à 72 heures.'
      : 'Your request has been sent. We usually reply within 48 to 72 hours.',
    error: isFrench ? 'Une erreur est survenue. Veuillez réessayer.' : 'Something went wrong. Please try again.',
    select: isFrench ? 'Sélectionnez…' : 'Select…',
  };

  const partnershipTypes = [
    { value: 'advertising', label: isFrench ? 'Publicité et sponsoring' : 'Advertising and sponsorship' },
    { value: 'editorial', label: isFrench ? 'Partenariat éditorial' : 'Editorial partnership' },
    { value: 'institutional', label: isFrench ? 'Partenariat institutionnel' : 'Institutional partnership' },
    { value: 'digital', label: isFrench ? 'Collaboration technique' : 'Technical collaboration' },
  ];

  const budgets = [
    { value: '1000-5000', label: '$1 000 – $5 000' },
    { value: '5000-10000', label: '$5 000 – $10 000' },
    { value: '10000-25000', label: '$10 000 – $25 000' },
    { value: '25000+', label: '$25 000+' },
  ];

  const timelines = [
    { value: 'immediate', label: isFrench ? 'Dès que possible' : 'As soon as possible' },
    { value: '1-3months', label: isFrench ? '1 à 3 mois' : '1 to 3 months' },
    { value: '3-6months', label: isFrench ? '3 à 6 mois' : '3 to 6 months' },
    { value: '6months+', label: isFrench ? 'Plus de 6 mois' : 'More than 6 months' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData(emptyForm);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.message || labels.error);
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage(labels.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    'w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{labels.success}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
            {labels.companyName} <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className={fieldClass}
            placeholder={isFrench ? 'Nom de l’organisation' : 'Organization name'}
          />
        </div>
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-foreground mb-2">
            {labels.contactName} <span className="text-red-500">*</span>
          </label>
          <input
            id="contactName"
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            className={fieldClass}
            placeholder={isFrench ? 'Votre nom' : 'Your name'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            {labels.email} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={fieldClass}
            placeholder="email@organisation.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            {labels.phone}
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={fieldClass}
            placeholder="+243 998 258 441"
          />
        </div>
      </div>

      <div>
        <label htmlFor="partnershipType" className="block text-sm font-medium text-foreground mb-2">
          {labels.partnershipType} <span className="text-red-500">*</span>
        </label>
        <select
          id="partnershipType"
          name="partnershipType"
          value={formData.partnershipType}
          onChange={handleChange}
          required
          className={fieldClass}
        >
          <option value="">{labels.select}</option>
          {partnershipTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-2">
            {labels.budget}
          </label>
          <select
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="">{labels.select}</option>
            {budgets.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-foreground mb-2">
            {labels.timeline}
          </label>
          <select
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="">{labels.select}</option>
            {timelines.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          {labels.message} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className={`${fieldClass} resize-none`}
          placeholder={
            isFrench
              ? 'Présentez votre organisation, vos objectifs et le type de collaboration souhaité.'
              : 'Tell us about your organization, your goals and the collaboration you have in mind.'
          }
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
