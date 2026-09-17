import { pickCopy } from '@/lib/copy';

export default async function CommuniquesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">
            {pickCopy(locale, {
              fr: 'Communiqués',
              en: 'Press releases',
              es: 'Comunicados',
              sw: 'Taarifa',
              ln: 'Ba communiqué',
              rw: 'Amatangazo',
            })}
          </h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: 'Les communiqués officiels seront bientôt disponibles depuis la rédaction.',
              en: 'Official press releases will soon be available from the newsroom.',
              es: 'Los comunicados oficiales estarán pronto disponibles desde la redacción.',
              sw: 'Taarifa rasmi zitapatikana hivi karibuni kutoka kwa wahariri.',
              ln: 'Ba communiqué officiel bakoya noki na rédaction.',
              rw: 'Amatangazo yemewe azaboneka vuba kuva ku kinyamakuru.',
            })}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          {pickCopy(locale, {
            fr: 'Aucun communiqué publié pour le moment.',
            en: 'No press releases published yet.',
            es: 'Aún no hay comunicados publicados.',
            sw: 'Hakuna taarifa zilizochapishwa bado.',
            ln: 'Communiqué moko te ezwami sikoyo.',
            rw: 'Nta matangazo yasohoye ubu.',
          })}
        </p>
      </div>
    </div>
  );
}
