import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LocaleLang from "@/components/LocaleLang";
import { getFooterPartners } from "@/lib/footer-partners";

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
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer partners={partners} />
    </div>
  );
}
