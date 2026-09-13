import { Metadata } from 'next';
import Link from 'next/link';
import PartnershipRequestForm from '@/components/PartnershipRequestForm';
import { prisma } from '@/lib/prisma';
import { SITE_ADDRESS, SITE_EMAIL, SITE_NAME, SITE_PHONE } from '@/lib/site-legal';

export const metadata: Metadata = {
  title: 'Partenariats - Malakinfo.com',
  description:
    'Collaborer avec MalakInfo : publicité, sponsoring, partenariats éditoriaux et institutionnels, dans le respect de l’indépendance éditoriale.',
};

function getPartnerWebsiteUrl(value: string | null) {
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString();
  } catch {
    return null;
  }
}

export default async function PartenariatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === 'fr';

  let partners: Array<{
    id: string;
    companyName: string;
    type: string;
    imageUrl: string | null;
    websiteUrl: string | null;
  }> = [];

  try {
    partners = await prisma.partnership.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        companyName: true,
        type: true,
        imageUrl: true,
        websiteUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {
    partners = [];
  }

  const typeLabels: Record<string, string> = {
    advertising: isFrench ? 'Publicité et sponsoring' : 'Advertising and sponsorship',
    editorial: isFrench ? 'Partenariat éditorial' : 'Editorial partnership',
    institutional: isFrench ? 'Partenariat institutionnel' : 'Institutional partnership',
    digital: isFrench ? 'Collaboration technique' : 'Technical collaboration',
    commercial: isFrench ? 'Partenariat commercial' : 'Commercial partnership',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          {isFrench ? 'Partenariats' : 'Partnerships'}
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground">
              {isFrench
                ? `${SITE_NAME} collabore avec des entreprises, des institutions et des organisations qui souhaitent soutenir un journalisme indépendant en Afrique. Les partenariats sont distincts de la rédaction : ils ne conditionnent pas nos enquêtes, nos titres ni nos choix éditoriaux.`
                : `${SITE_NAME} works with companies, institutions and organizations that want to support independent journalism in Africa. Partnerships stay separate from the newsroom: they do not shape our reporting, headlines or editorial choices.`}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Publicité et sponsoring' : 'Advertising and sponsorship'}
            </h2>
            <p className="text-muted-foreground">
              {isFrench
                ? 'Espaces publicitaires, sponsoring de rubriques ou de formats, et campagnes clairement identifiées comme telles. Toute communication commerciale est distinguée de l’information.'
                : 'Advertising space, section or format sponsorships, and campaigns that are clearly labelled as such. Commercial communication is always kept distinct from news.'}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Partenariats éditoriaux' : 'Editorial partnerships'}
            </h2>
            <p className="text-muted-foreground">
              {isFrench
                ? 'Dossiers, événements, podcasts ou publications réalisés avec un partenaire, lorsque le sujet présente un intérêt public. La rédaction conserve le dernier mot sur le contenu.'
                : 'Reports, events, podcasts or publications produced with a partner when the subject is of public interest. The newsroom keeps the final say on the content.'}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Partenariats institutionnels' : 'Institutional partnerships'}
            </h2>
            <p className="text-muted-foreground">
              {isFrench
                ? 'Collaborations avec des organisations, des universités, des ONG ou des institutions publiques autour de l’information, de la formation ou de campagnes d’intérêt général.'
                : 'Collaborations with organizations, universities, NGOs or public institutions around news, training or public-interest campaigns.'}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Indépendance' : 'Independence'}
            </h2>
            <p className="text-muted-foreground">
              {isFrench ? (
                <>
                  Nous refusons tout financement qui imposerait un angle, une omission ou une validation préalable des articles. Ces règles sont décrites dans notre{' '}
                  <Link href={`/${locale}/charte`} className="text-primary hover:underline">
                    charte éthique
                  </Link>
                  .
                </>
              ) : (
                <>
                  We refuse any funding that would impose an angle, an omission or prior approval of articles. These rules are set out in our{' '}
                  <Link href={`/${locale}/charte`} className="text-primary hover:underline">
                    editorial charter
                  </Link>
                  .
                </>
              )}
            </p>
          </section>

          {partners.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                {isFrench ? 'Nos partenaires' : 'Our partners'}
              </h2>
              <ul className="not-prose space-y-3">
                {partners.map((partner) => {
                  const website = getPartnerWebsiteUrl(partner.websiteUrl);
                  return (
                    <li
                      key={partner.id}
                      className="flex items-center gap-4 border border-border rounded-lg px-4 py-3"
                    >
                      {partner.imageUrl ? (
                        <img
                          src={partner.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        {website ? (
                          <a
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {partner.companyName}
                          </a>
                        ) : (
                          <p className="font-medium text-foreground">{partner.companyName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {typeLabels[partner.type] || partner.type}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Proposer une collaboration' : 'Propose a collaboration'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isFrench
                ? 'Décrivez votre projet. Nous répondons aux demandes sérieuses sous 48 à 72 heures.'
                : 'Describe your project. We reply to serious requests within 48 to 72 hours.'}
            </p>
            <div className="not-prose">
              <PartnershipRequestForm locale={locale} />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {isFrench ? 'Nous écrire directement' : 'Write to us directly'}
            </h2>
            <p className="text-muted-foreground">Email : {SITE_EMAIL}</p>
            <p className="text-muted-foreground">
              {isFrench ? 'Téléphone' : 'Phone'} : {SITE_PHONE}
            </p>
            <p className="text-muted-foreground">{SITE_ADDRESS}</p>
            <p className="text-muted-foreground">
              {isFrench ? (
                <>
                  Vous pouvez aussi nous soutenir via la page{' '}
                  <Link href={`/${locale}/nous-soutenir`} className="text-primary hover:underline">
                    Nous soutenir
                  </Link>
                  .
                </>
              ) : (
                <>
                  You can also support us on the{' '}
                  <Link href={`/${locale}/nous-soutenir`} className="text-primary hover:underline">
                    Support us
                  </Link>{' '}
                  page.
                </>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
