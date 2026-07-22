import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "Malakin.info - L'info qui traverse les frontières",
  description: "Informer, éduquer et connecter l'Afrique à travers un journalisme indépendant, fiable et multiculturel.",
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4621769509750492"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
