import Link from 'next/link';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: string;
}

export default function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  // Ne pas afficher le titre d’article dans le fil (évite la répétition avec le H1).
  const visibleItems = items.filter((item) => Boolean(item.href));

  return (
    <nav
      className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <Link
        href={`/${locale}`}
        className="inline-flex items-center transition-colors hover:text-foreground"
        aria-label="Accueil"
      >
        <Home className="h-4 w-4" />
      </Link>

      {visibleItems.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex min-w-0 items-center gap-2">
          <span className="text-muted-foreground/70" aria-hidden="true">
            /
          </span>
          {item.href ? (
            <Link
              href={item.href}
              className="truncate text-foreground underline underline-offset-2 decoration-foreground/40 transition-colors hover:decoration-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
