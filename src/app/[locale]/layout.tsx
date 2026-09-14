import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LocaleLang from "@/components/LocaleLang";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleLang locale={locale} />
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
