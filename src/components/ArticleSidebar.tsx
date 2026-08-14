import Link from 'next/link';
import { Mail } from 'lucide-react';

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
  const sponsorCountLabel = `${sponsors.length} ${sponsors.length > 1 ? 'publicités' : 'publicité'}`;

  return (
    <div className="flex w-full max-w-[300px] flex-col gap-10">
      {sponsors.length > 0 && (
        <div className="w-full rounded-sm border border-gray-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
            <span>PUBLICITÉ</span>
            <span className="rounded-full bg-[#F9F1D1] px-2 py-1 text-[9px] text-[#0B3B8B]">
              {sponsorCountLabel}
            </span>
          </div>

          <div className="space-y-2">
            {sponsors.map((item) => (
              <a
                key={item.id}
                href={item.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="block h-auto w-full object-cover"
                  />
                </div>

                <div className="mt-2 flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 flex-1 text-[12px] font-bold leading-snug text-[#0B3B8B] group-hover:text-[#D4AF37]">
                    {item.title}
                  </h4>
                  <span className="mt-0.5 inline-flex items-center rounded bg-[#0B3B8B] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                    JE M'ABONNE
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto w-full border-t border-gray-200 bg-white pt-5">
        <Link
          href={newsletterHref}
          aria-label="S'abonner à la newsletter"
          title="S'abonner à la newsletter"
          className="group flex items-end justify-between gap-3 rounded-sm transition-colors hover:text-[#D4AF37]"
        >
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#0B3B8B] group-hover:text-[#D4AF37]">Newsletter</h3>
            <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-700">
              Recevez les meilleurs contenus directement dans votre boîte mail.
            </p>
          </div>

          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#0B3B8B] text-white shadow-sm transition-colors group-hover:bg-[#D4AF37]">
            <Mail className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
