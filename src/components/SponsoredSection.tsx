import React from 'react';

export interface SponsoredItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  categoryBadge?: string;
}

interface SponsoredSectionProps {
  items: SponsoredItem[];
}

export const SponsoredSection: React.FC<SponsoredSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12 w-full">
      <h2 className="mb-4 text-xl font-black uppercase tracking-wide text-gray-900">
        Contenus sponsorisés
      </h2>

      <div className="bg-transparent">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item) => {
            const badge = item.categoryBadge || 'Publicité';

            return (
              <a
                key={item.id}
                href={item.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden bg-transparent transition-shadow duration-200 hover:shadow-sm"
              >
                <div className="relative aspect-[4/2.5] w-full overflow-hidden bg-gray-200">
                  <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {badge}
                  </span>

                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 md:text-[17px]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Sponsorisé : <span className="capitalize">{item.sponsorName}</span>
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
