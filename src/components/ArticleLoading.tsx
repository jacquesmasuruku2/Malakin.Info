export default function ArticleLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-14 w-14 text-primary"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M24 4a20 20 0 0 1 20 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <g className="article-loading-clock-hand">
          <path d="M24 24V11" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="24" cy="24" r="2.5" fill="#D4AF37" />
      </svg>
      <div>
        <p className="font-semibold text-primary">Chargement de l’article…</p>
        <p className="mt-1 text-sm text-muted-foreground">Préparation du contenu à lire</p>
      </div>
    </div>
  );
}
