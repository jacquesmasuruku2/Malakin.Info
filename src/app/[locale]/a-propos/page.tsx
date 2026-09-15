import { Metadata } from 'next';
import Link from 'next/link';
import { PUBLICATION_DIRECTOR, SITE_ADDRESS, SITE_EMAIL, SITE_NAME, SITE_PHONE } from '@/lib/site-legal';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'À propos - Malakinfo.com',
  description: 'MalakInfo est un média d’information indépendant basé à Kinshasa, consacré à l’Afrique et au monde.',
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
          {pickCopy(locale, {
            fr: `À propos de ${SITE_NAME}`,
            en: `About ${SITE_NAME}`,
            es: `Acerca de ${SITE_NAME}`,
            sw: `Kuhusu ${SITE_NAME}`,
            ln: `Na ntina ya ${SITE_NAME}`,
            rw: `Ibyerekeye ${SITE_NAME}`,
          })}
        </h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            {pickCopy(locale, {
              fr: `${SITE_NAME} est un média d’information indépendant, édité à Kinshasa, en République démocratique du Congo. Nous publions des actualités, des analyses et des dossiers sur l’Afrique et le monde, avec une attention particulière à la RDC et à sa diaspora.`,
              en: `${SITE_NAME} is an independent news outlet based in Kinshasa, Democratic Republic of the Congo. We publish news, analysis and features about Africa and the world, with particular attention to the DRC and its diaspora.`,
              es: `${SITE_NAME} es un medio de información independiente, editado en Kinshasa, República Democrática del Congo. Publicamos noticias, análisis y reportajes sobre África y el mundo, con especial atención a la RDC y su diáspora.`,
              sw: `${SITE_NAME} ni chombo huru cha habari kinachohaririwa Kinshasa, Jamhuri ya Kidemokrasia ya Kongo. Tunachapisha habari, uchambuzi na makala kuhusu Afrika na dunia, tukizingatia DRC na diaspora yake.`,
              ln: `${SITE_NAME} ezali média ya sango ya independant, eyebani na Kinshasa, République démocratique du Congo. Topesa sango, ba analyse mpe ba dossier na ntina ya Afrique mpe ya mokili, na toli mingi na RDC mpe na diaspora na yango.`,
              rw: `${SITE_NAME} ni itangazamakuru ryigenga rikorera i Kinshasa, muri Repubulika Iharanira Demokarasi ya Kongo. Dutangaza amakuru, isesengura n’inkuru z’Afurika n’isi, twita cyane kuri RDC n’abaturage bayo bo hanze.`,
            })}
          </p>
          <p>
            {pickCopy(locale, {
              fr: 'Notre ligne est celle d’un journalisme de service public : vérifier, contextualiser et expliquer. Le site est conçu pour les lecteurs, pas pour dupliquer des dépêches sans valeur ajoutée.',
              en: 'Our approach is public-service journalism: verify, contextualize and explain. The site is built for readers, not to copy wire copy without added value.',
              es: 'Nuestra línea es un periodismo de servicio público: verificar, contextualizar y explicar. El sitio está pensado para los lectores, no para copiar teletipos sin valor añadido.',
              sw: 'Mtazamo wetu ni uandishi wa habari wa huduma kwa umma: kuthibitisha, kutoa muktadha na kueleza. Tovuti imeundwa kwa wasomaji, si kunakili habari bila thamani.',
              ln: 'Ligne na biso ezali journalisme ya service public: kotalela, kopesa contexte mpe kolimbola. Site ezali mpo na ba lecteur, te mpo na ko copier ba dépêche sans valeur.',
              rw: 'Umurongo wacu ni ubunyamakuru bwa serivisi rusange: kugenzura, gutanga imiterere no gusobanura. Urubuga rwubakiwe abasomyi, si gukoporora amakuru adafite agaciro.',
            })}
          </p>

          <h2 className="font-heading text-2xl font-bold text-foreground">
            {pickCopy(locale, {
              fr: 'Qui nous sommes',
              en: 'Who we are',
              es: 'Quiénes somos',
              sw: 'Sisi ni nani',
              ln: 'Nani tozali',
              rw: 'Turi bande',
            })}
          </h2>
          <p>
            {pickCopy(locale, {
              fr: `${SITE_NAME} est édité par ${PUBLICATION_DIRECTOR} et porté par une rédaction de journalistes, de contributeurs et d’une équipe technique basée à Kinshasa. Les auteurs sont identifiés sur les articles et sur la page équipe.`,
              en: `${SITE_NAME} is published by ${PUBLICATION_DIRECTOR} and run by journalists, contributors and a technical team based in Kinshasa. Authors are identified on articles and on the team page.`,
              es: `${SITE_NAME} está editado por ${PUBLICATION_DIRECTOR} y lo impulsa una redacción de periodistas, colaboradores y un equipo técnico en Kinshasa. Los autores aparecen en los artículos y en la página del equipo.`,
              sw: `${SITE_NAME} inahaririwa na ${PUBLICATION_DIRECTOR} na kuendeshwa na waandishi, wachangiaji na timu ya kiufundi Kinshasa. Waandishi hutambulishwa kwenye makala na ukurasa wa timu.`,
              ln: `${SITE_NAME} eyebani na ${PUBLICATION_DIRECTOR} mpe etambwisami na ba journaliste, ba contributeur mpe équipe technique na Kinshasa. Ba auteur bazali na ba article mpe na page ya équipe.`,
              rw: `${SITE_NAME} irakangurwa na ${PUBLICATION_DIRECTOR} kandi ikorwa n’abanyamakuru, abafatanyabikorwa n’ikipe y’ikoranabuhanga i Kinshasa. Abanditsi bamenyekana ku nkuru no ku rupapuro rw’ikipe.`,
            })}
          </p>

          <h2 className="font-heading text-2xl font-bold text-foreground">
            {pickCopy(locale, {
              fr: 'Ce que nous publions',
              en: 'What we publish',
              es: 'Qué publicamos',
              sw: 'Tunachochapisha',
              ln: 'Nini topesa',
              rw: 'Icyo dusohora',
            })}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {pickCopy(locale, {
                fr: 'Actualités politiques, économiques, diplomatiques et sportives',
                en: 'Political, economic, diplomatic and sports news',
                es: 'Actualidad política, económica, diplomática y deportiva',
                sw: 'Habari za siasa, uchumi, diplomasia na michezo',
                ln: 'Sango ya politique, économie, diplomatie mpe sport',
                rw: 'Amakuru ya politiki, ubukungu, ubucuti bw’amahanga n’imikino',
              })}
            </li>
            <li>
              {pickCopy(locale, {
                fr: 'Dossiers de société, santé, culture et science',
                en: 'Society, health, culture and science features',
                es: 'Dossiers de sociedad, salud, cultura y ciencia',
                sw: 'Makala ya jamii, afya, utamaduni na sayansi',
                ln: 'Ba dossier ya société, santé, culture mpe science',
                rw: 'Inkuru z’abaturage, ubuzima, umuco n’ubuhanga',
              })}
            </li>
            <li>
              {pickCopy(locale, {
                fr: 'Contenus multimédias : photos, vidéos, lives et radio',
                en: 'Multimedia: photos, videos, live streams and radio',
                es: 'Contenidos multimedia: fotos, vídeos, directos y radio',
                sw: 'Maudhui ya multimedia: picha, video, matangazo moja kwa moja na redio',
                ln: 'Ba contenu multimédia: ba photo, ba vidéo, ba live mpe radio',
                rw: 'Ibirimo bya multimedia: amafoto, amashusho, live na radio',
              })}
            </li>
            <li>
              {pickCopy(locale, {
                fr: 'Offres d’emploi et informations pratiques',
                en: 'Job offers and practical information',
                es: 'Ofertas de empleo e información práctica',
                sw: 'Nafasi za kazi na taarifa za vitendo',
                ln: 'Ba offre ya mosala mpe sango ya pratique',
                rw: 'Amahirwe y’akazi n’amakuru y’uburyo',
              })}
            </li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-foreground">
            {pickCopy(locale, {
              fr: 'Où nous trouver',
              en: 'Where to find us',
              es: 'Dónde encontrarnos',
              sw: 'Mahali pa kutupata',
              ln: 'Esika okokuta biso',
              rw: 'Aho wadusanga',
            })}
          </h2>
          <p>{SITE_ADDRESS}</p>
          <p>Email : {SITE_EMAIL}</p>
          <p>
            {pickCopy(locale, {
              fr: 'Téléphone',
              en: 'Phone',
              es: 'Teléfono',
              sw: 'Simu',
              ln: 'Téléphone',
              rw: 'Telefoni',
            })}
            {' : '}
            {SITE_PHONE}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href={`/${locale}/equipe`} className="text-primary hover:underline font-medium">
              {pickCopy(locale, {
                fr: 'Rencontrer l’équipe',
                en: 'Meet the team',
                es: 'Conocer al equipo',
                sw: 'Kutana na timu',
                ln: 'Kutana na équipe',
                rw: 'Guhura n’ikipe',
              })}
            </Link>
            <Link href={`/${locale}/mission`} className="text-primary hover:underline font-medium">
              {messages.nav.mission}
            </Link>
            <Link href={`/${locale}/charte`} className="text-primary hover:underline font-medium">
              {messages.nav.charter}
            </Link>
            <Link href={`/${locale}/contact`} className="text-primary hover:underline font-medium">
              {messages.nav.contact}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
