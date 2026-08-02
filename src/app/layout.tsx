import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import MobileBottomNav from "@/components/MobileBottomNav";
import ServicesModal from "@/components/ServicesModal";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: {
    default: "Malakinfo.com - L'info qui traverse les frontières",
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
    title: 'Malakinfo.com - L\'info qui traverse les frontières',
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
    title: 'Malakinfo.com - L\'info qui traverse les frontières',
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
  verification: {
    google: "ca-pub-4621769509750492",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("h-full", "antialiased", jetbrainsMono.variable)}>
      <head>
        <meta name="google-site-verification" content="ca-pub-4621769509750492" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4621769509750492"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        <Providers>
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <MobileBottomNav />
          <ServicesModal />
        </Providers>
      </body>
    </html>
  );
}
