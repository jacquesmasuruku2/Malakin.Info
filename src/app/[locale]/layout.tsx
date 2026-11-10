import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LocaleLang from "@/components/LocaleLang";
import { MarketProvider } from "@/contexts/MarketContext";
import { getFooterPartners } from "@/lib/footer-partners";

export const revalidate = 60;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const partners = await getFooterPartners();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleLang locale={locale} />
      <MarketProvider>
        <Navigation />
        <main className="flex-1">{children}</main>
      </MarketProvider>
      <Footer partners={partners} />
    </div>
  );
}
