import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
