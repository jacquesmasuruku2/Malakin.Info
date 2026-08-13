import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import MobileBottomNav from "@/components/MobileBottomNav";
import RadioPlayer from "@/components/RadioPlayer";
import ServicesModal from "@/components/ServicesModal";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-4621769509750492';
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

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
    <html lang="fr" className={cn("h-full", "antialiased", jetbrainsMono.variable)}>
      <head>
        <Script id="gtm-script" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WTSZH2PT');`}
        </Script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8V0GJZF6WD"
          strategy="afterInteractive"
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-8V0GJZF6WD');`}
        </Script>
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WTSZH2PT"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <SplashScreen />
        <Providers>
          <main className="flex-1 pt-20 pb-16 md:pb-0 md:pt-24">
            {children}
          </main>
          <RadioPlayer />
          <MobileBottomNav />
          <ServicesModal />
        </Providers>
      </body>
    </html>
  );
}
