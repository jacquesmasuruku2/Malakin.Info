import { redirect } from 'next/navigation';

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect(locale === 'fr' ? 'https://malakinfo.com/fr/newsletter' : 'https://malakinfo.com/en/newsletter');
}
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          Nous respectons votre vie privée. Vos informations ne sont jamais partagées.{' '}
          <a href="/politique-de-confidentialite" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </div>
  );
}
