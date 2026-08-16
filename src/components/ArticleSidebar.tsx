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

export default function ArticleSidebar({ sponsors }: ArticleSidebarProps) {
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

                <div className="mt-2">
                  <h4 className="line-clamp-2 text-[12px] font-bold leading-snug text-[#0B3B8B] group-hover:text-[#D4AF37]">
                    {item.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
