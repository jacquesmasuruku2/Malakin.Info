import Link from 'next/link';
import type { ArticleTagItem } from '@/lib/tags';

export default function ArticleTags({
  tags,
  locale,
}: {
  tags: ArticleTagItem[];
  locale: string;
}) {
  if (!tags.length) return null;

  return (
    <nav className="article-tags" aria-label="Tags">
      {tags.map((tag, index) => (
        <Link
          key={tag.slug}
          href={`/${locale}/tag/${tag.slug}`}
          className="article-tag-chip"
          style={{ ['--i' as string]: index }}
        >
          <span className="article-tag-hash" aria-hidden="true">#</span>
          <span>{tag.name}</span>
        </Link>
      ))}
    </nav>
  );
}
