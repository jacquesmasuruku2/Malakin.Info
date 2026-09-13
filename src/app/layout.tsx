import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import ServicesModal from "@/components/ServicesModal";
import RadioPlayer from "@/components/RadioPlayer";
import SplashScreen from "@/components/SplashScreen";
import ConsentScripts from "@/components/ConsentScripts";
import "./globals.css";

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

export const metadata: Metadata = {
  title: {
    default: "Malakinfo.com | L'info qui traverse les frontières",
    template: "%s | Malakinfo.com"
  },
  description: "Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel. Actualités, culture, économie, politique et plus encore.",
  keywords: ["actualités", "Afrique", "journalisme", "culture", "économie", "politique", "Malakinfo", "news"],
  authors: [{ name: "Malakinfo" }],
  creator: "Malakinfo",
  publisher: "Malakinfo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://malakinfo.com'),
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://malakinfo.com',
    title: 'Malakinfo.com | L\'info qui traverse les frontières',
    description: 'Informer, éduquer et connecter l\'Afrique à travers un journalisme indépendant, fiable et multiculturel.',
    siteName: 'Malakinfo',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Malakinfo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Malakinfo.com | L\'info qui traverse les frontières',
    description: 'Informer, éduquer et connecter l\'Afrique à travers un journalisme indépendant, fiable et multiculturel.',
    images: ['/images/logo.png'],
    creator: '@malakinfo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? { google: GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full", "antialiased")}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ConsentScripts />
        <SplashScreen />
        <Providers>
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <ServicesModal />
          <RadioPlayer />
        </Providers>
      </body>
    </html>
  );
}
