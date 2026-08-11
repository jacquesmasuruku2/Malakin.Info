import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, supportedLocales, getMessages } from '@/lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = locale || defaultLocale;

  if (!normalizedLocale || !supportedLocales.includes(normalizedLocale as (typeof supportedLocales)[number])) {
    notFound();
  }

  return {
    locale: normalizedLocale,
    messages: getMessages(normalizedLocale),
  };
});
