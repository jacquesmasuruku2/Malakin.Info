import { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_UPDATED_AT, PUBLICATION_DIRECTOR, SITE_EMAIL, SITE_NAME } from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Charte éthique - Malakinfo.com',
  description: 'La charte éthique de MalakInfo : vérification des sources, indépendance, droit de réponse et correction des erreurs.',
};

export default async function ChartePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          Charte éthique
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              {SITE_NAME}, édité par {PUBLICATION_DIRECTOR}, s’engage à respecter les standards du journalisme indépendant. Cette charte définit les principes qui guident notre travail quotidien.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Vérification des sources</h2>
            <p className="text-muted-foreground">
              Les informations sont vérifiées auprès de sources multiples et fiables avant publication. Nous ne publions pas une information sans confirmation croisée, sauf mention claire du degré d’incertitude.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Indépendance</h2>
            <p className="text-muted-foreground">
              Nous maintenons une position indépendante et ne servons aucun agenda politique ou confessionnel. La couverture vise l’équilibre et présente les faits, le contexte et les points de vue pertinents.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Droit de réponse</h2>
            <p className="text-muted-foreground">
              Toute personne mentionnée dans nos articles peut demander à s’exprimer. Lorsque la demande est fondée, nous publions la réponse de manière visible.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Transparence des financements</h2>
            <p className="text-muted-foreground">
              Notre indépendance éditoriale n’est pas à vendre. Nous refusons tout financement qui conditionnerait le contenu. Les partenariats et les soutiens sont distingués de l’information rédactionnelle.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Respect de la vie privée</h2>
            <p className="text-muted-foreground">
              Nous respectons la vie privée des personnes, sauf lorsque l’intérêt public justifie une divulgation.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Correction des erreurs</h2>
            <p className="text-muted-foreground">
              En cas d’erreur, nous la corrigeons rapidement et de manière visible. La procédure est décrite dans notre{' '}
              <Link href={`/${locale}/politique-correction`} className="text-primary hover:underline">
                politique de correction
              </Link>
              . Vous pouvez aussi écrire à {SITE_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Documents liés</h2>
            <p className="text-muted-foreground">
              Consultez notre{' '}
              <Link href={`/${locale}/mission`} className="text-primary hover:underline">
                mission
              </Link>
              , la page{' '}
              <Link href={`/${locale}/a-propos`} className="text-primary hover:underline">
                À propos
              </Link>
              {' '}et l’{' '}
              <Link href={`/${locale}/equipe`} className="text-primary hover:underline">
                équipe
              </Link>
              .
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Date de dernière mise à jour : {LEGAL_UPDATED_AT}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
