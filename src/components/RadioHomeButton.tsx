'use client';

import RadioOnAirWidget from '@/components/RadioOnAirWidget';

export default function RadioHomeButton({ compact = false }: { compact?: boolean }) {
  return <RadioOnAirWidget compact={compact} />;
}
