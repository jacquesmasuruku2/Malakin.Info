/** Outline account icon matching the navbar login glyph (no fill). */
export default function NavAccountIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="7.2"
        r="3.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.25 19.85c0-3.05 2.95-5.5 6.75-5.5s6.75 2.45 6.75 5.5c0 .55-.4.9-.9.9H6.15c-.5 0-.9-.35-.9-.9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
