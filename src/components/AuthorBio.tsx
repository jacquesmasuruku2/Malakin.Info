import { normalizeAuthorBioHtml } from '@/lib/author-bio';

type AuthorBioProps = {
  html: string | null | undefined;
  className?: string;
  /** Dark hero backgrounds (e.g. /auteurs/[slug]) */
  onDark?: boolean;
};

export default function AuthorBio({ html, className = '', onDark = false }: AuthorBioProps) {
  const content = normalizeAuthorBioHtml(html);
  if (!content) return null;

  return (
    <div
      className={`author-bio ${onDark ? 'author-bio--on-dark' : ''} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
