import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const locales = ['fr', 'en'];

export const metadata: Metadata = {
  title: "Malakin.info - L'info qui traverse les frontières",
  description: "Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.",
  verification: {
    google: "ca-pub-4621769509750492",
  },
};

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  const messages = getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", jetbrainsMono.variable)}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4621769509750492"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
