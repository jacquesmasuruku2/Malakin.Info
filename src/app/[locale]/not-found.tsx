import type { Metadata } from 'next';
import LocaleNotFoundContent from './LocaleNotFoundContent';

export const metadata: Metadata = {
  title: 'Content unavailable | MalakInfo',
  robots: { index: false, follow: true },
};

export default function LocaleNotFound() {
  return <LocaleNotFoundContent />;
}
