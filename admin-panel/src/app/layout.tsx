import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "Admin Panel - Malakinfo.com",
  description: "Panneau d'administration pour Malakinfo.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="blue">
      <body className={jetbrainsMono.variable}>
        <Script id="admin-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('admin-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
