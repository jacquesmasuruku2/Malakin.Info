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

      <div className="rounded-md bg-gray-100 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item) => {
            const badge = item.categoryBadge || 'Publicité';

            return (
              <a
                key={item.id}
                href={item.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                  <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {badge}
                  </span>

                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 md:text-base">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-gray-500">
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
