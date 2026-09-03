import Link from 'next/link';
import { User } from 'lucide-react';

type ArticleAuthorLinkProps = {
  author?: {
    name: string;
    slug: string;
  } | null;
  locale: string;
  fallback?: string;
  className?: string;
};

export default function ArticleAuthorLink({
  author,
  locale,
  fallback = 'Malakinfo',
  className = '',
}: ArticleAuthorLinkProps) {
  if (!author) {
    return <span className={`inline-flex items-center gap-1 ${className}`}><User className="h-4 w-4" />{fallback}</span>;
  }

  return (
    <Link
      href={`/${locale}/equipe/${author.slug}`}
      className={`inline-flex items-center gap-1 hover:text-primary transition-colors ${className}`}
    >
      <User className="h-4 w-4" />
      {author.name}
    </Link>
  );
}