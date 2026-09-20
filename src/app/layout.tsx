import type { Metadata } from "next";
import Script from "next/script";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import ServicesModal from "@/components/ServicesModal";
import LazyRadioPlayer from "@/components/LazyRadioPlayer";
import ConsentScripts from "@/components/ConsentScripts";
import SiteJsonLd from "@/components/SiteJsonLd";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var logged=!!localStorage.getItem('user')||document.cookie.indexOf('session_token=')!==-1||document.cookie.indexOf('next-auth.session-token=')!==-1||document.cookie.indexOf('__Secure-next-auth.session-token=')!==-1;if(logged&&localStorage.getItem('malakinfo.theme')==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`;


const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

export const metadata: Metadata = {
  title: {
    default: "MalakInfo (Malaki Info) | L'info qui traverse les frontières",
    template: "%s | MalakInfo"
  },
  description:
    "MalakInfo — aussi appelé Malaki ou Malaki Info — média d'actualité africaine basé à Kinshasa. Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.",
  keywords: [
    "MalakInfo",
    "Malaki",
    "Malaki Info",
    "Malakinfo",
    "Malakin",
    "Malakinfo.com",
    "actualités",
    "Afrique",
    "RDC",
    "Kinshasa",
    "journalisme",
    "culture",
    "économie",
    "politique",
    "news",
  ],
  authors: [{ name: "MalakInfo" }],
  creator: "MalakInfo",
  publisher: "MalakInfo",
  applicationName: "MalakInfo",
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
    title: "MalakInfo (Malaki Info) | L'info qui traverse les frontières",
    description:
      "MalakInfo — aussi appelé Malaki ou Malaki Info — informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.",
    siteName: 'MalakInfo',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'MalakInfo — Malaki Info',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MalakInfo (Malaki Info) | L'info qui traverse les frontières",
    description:
      "MalakInfo — aussi appelé Malaki ou Malaki Info — informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.",
    images: ['/images/logo.png'],
    creator: '@Malakinfo1',
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
    <html lang="fr" className={cn("h-full", "antialiased")} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <SiteJsonLd />
        <Script id="malakinfo-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ConsentScripts />
        <Providers>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
          <ServicesModal />
          <LazyRadioPlayer />
        </Providers>
      </body>
    </html>
  );
}
