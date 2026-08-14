import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

export interface ArticleSidebarSponsor {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  categoryBadge?: string;
}

interface ArticleSidebarProps {
  locale: string;
  sponsors: ArticleSidebarSponsor[];
}

export default function ArticleSidebar({ locale, sponsors }: ArticleSidebarProps) {
  const newsletterHref = `/${locale}/newsletter`;

  return (
    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-center rounded-full bg-red-600 p-2 text-white shadow-sm w-12 h-12">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-wide text-gray-900">
          Newsletter
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Recevez les meilleurs contenus directement dans votre boîte mail.
        </p>
        <Link
          href={newsletterHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          S&apos;abonner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {sponsors.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-gray-800">
            Contenus sponsorisés
          </h3>
          <div className="space-y-4">
            {sponsors.map((item) => (
              <a
                key={item.id}
                href={item.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <span className="absolute left-2 top-2 z-10 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    {item.categoryBadge || 'Publicité'}
                  </span>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:text-red-700">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-500">
                    Sponsorisé par <span className="font-semibold text-gray-700">{item.sponsorName}</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
