@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: 'Arial', sans-serif;
  --font-mono: var(--font-mono);
  --font-heading: 'Times New Roman', serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: #ffffff;
  --foreground: #081C3D;
  --card: #ffffff;
  --card-foreground: #081C3D;
  --popover: #ffffff;
  --popover-foreground: #081C3D;
  --primary: #0B3B8B;
  --primary-foreground: #ffffff;
  --secondary: #D4AF37;
  --secondary-foreground: #081C3D;
  --muted: #f8f9fa;
  --muted-foreground: #4A5568;
  --accent: #D4AF37;
  --accent-foreground: #081C3D;
  --destructive: #E63946;
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #0B3B8B;
  --chart-1: #0B3B8B;
  --chart-2: #D4AF37;
  --chart-3: #081C3D;
  --chart-4: #4A5568;
  --chart-5: #f8f9fa;
  --radius: 0.5rem;
  --sidebar: #f8f9fa;
  --sidebar-foreground: #081C3D;
  --sidebar-primary: #0B3B8B;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #D4AF37;
  --sidebar-accent-foreground: #081C3D;
  --sidebar-border: #e5e7eb;
  --sidebar-ring: #0B3B8B;
  --font-heading: 'Times New Roman', serif;
  --font-sans: 'Arial', sans-serif;
  --brand-blue: #0B3B8B;
  --brand-gold: #D4AF37;
}

.dark {
  --background: #070d18;
  --foreground: #e8eef8;
  --card: #101a2c;
  --card-foreground: #e8eef8;
  --popover: #101a2c;
  --popover-foreground: #e8eef8;
  --primary: #4f8ef7;
  --primary-foreground: #07111f;
  --secondary: #d4af37;
  --secondary-foreground: #1a1404;
  --muted: #152238;
  --muted-foreground: #9db0c9;
  --accent: #d4af37;
  --accent-foreground: #1a1404;
  --destructive: #f07178;
  --border: #24364f;
  --input: #24364f;
  --ring: #4f8ef7;
  --chart-1: #4f8ef7;
  --chart-2: #d4af37;
  --chart-3: #7dd3c7;
  --chart-4: #9db0c9;
  --chart-5: #152238;
  --sidebar: #0c1626;
  --sidebar-foreground: #e8eef8;
  --sidebar-primary: #4f8ef7;
  --sidebar-primary-foreground: #07111f;
  --sidebar-accent: #d4af37;
  --sidebar-accent-foreground: #1a1404;
  --sidebar-border: #24364f;
  --sidebar-ring: #4f8ef7;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    line-height: 1.7;
    letter-spacing: 0.01em;
  }
  html {
    @apply font-sans;
    color-scheme: light;
  }
  html.dark {
    color-scheme: dark;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  p {
    line-height: 1.8;
    letter-spacing: 0.01em;
  }
}

@layer utilities {
  .readable-content {
    max-width: 75ch;
    line-height: 1.8;
    letter-spacing: 0.01em;
  }
  .comfortable-spacing {
    padding: 1.5rem;
  }
  .improved-contrast {
    color: var(--foreground);
  }
  .premium-preview-fade {
    position: relative;
    max-height: 13.2em;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 36%,
      rgba(0, 0, 0, 0.82) 52%,
      rgba(0, 0, 0, 0.48) 68%,
      rgba(0, 0, 0, 0.16) 84%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 36%,
      rgba(0, 0, 0, 0.82) 52%,
      rgba(0, 0, 0, 0.48) 68%,
      rgba(0, 0, 0, 0.16) 84%,
      transparent 100%
    );
  }
  .marquee-track {
    overflow: hidden;
    white-space: nowrap;
  }
  .marquee-content {
    display: inline-block;
    padding-left: 100%;
    animation: marquee 14s linear infinite;
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
}

.article-body,
.article-body * {
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.article-body img,
.article-body iframe,
.article-body video,
.article-body table,
.article-body pre,
.article-body code {
  max-width: 100% !important;
  display: block;
}

.article-body table {
  overflow-x: auto;
  display: block;
}

.article-body {
  color: var(--foreground);
}

.article-body p {
  margin-top: 0;
  margin-bottom: 1em;
}

.article-body :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th) {
  color: var(--foreground);
}

.article-body a {
  color: var(--primary);
}

.article-body .tableWrapper {
  width: 100%;
  max-width: 100%;
  margin: 1.25rem 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border: 1px solid color-mix(in srgb, var(--foreground) 14%, transparent);
  border-radius: 0.4rem;
}

.article-body .tableWrapper table.article-table {
  width: 100%;
  min-width: 34rem;
  margin: 0;
  border-collapse: collapse;
  border: 0;
  font-size: 0.9em;
}

.article-body .tableWrapper :is(th, td) {
  min-width: 7rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--foreground) 14%, transparent);
  text-align: left;
  vertical-align: top;
}

.article-body .tableWrapper th {
  background: color-mix(in srgb, var(--primary) 12%, var(--background));
  color: var(--foreground);
  font-weight: 700;
}

.article-body .tableWrapper tr:nth-child(even) td {
  background: color-mix(in srgb, var(--foreground) 3%, var(--background));
}

.article-body img,
.article-body .article-inline-image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 0.75rem 0 0.15rem;
  border: 2px solid #111111;
  box-shadow:
    0 0 0 3px #ffffff,
    0 0 0 5px #111111;
  background: #ffffff;
}

.article-image-frame {
  display: block;
  margin: 0;
  border: 2px solid #111111;
  box-shadow:
    0 0 0 3px #ffffff,
    0 0 0 5px #111111;
  background: #ffffff;
}

.article-image-frame img {
  display: block;
  width: 100%;
  height: auto;
  border: 0;
  box-shadow: none;
  background: transparent;
}

.article-preview-frame {
  position: relative;
  overflow: hidden;
  border: 2px solid #111111;
  box-shadow:
    0 0 0 3px #ffffff,
    0 0 0 5px #111111;
  background: #ffffff;
}

.article-preview-frame img {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  box-shadow: none;
  object-fit: cover;
}

.article-body figure,
.article-body figure.article-inline-figure {
  margin: 0.75rem 0 0.9rem;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.article-body figure.article-audio-card,
.article-body figure.article-video-card {
  box-sizing: border-box;
  max-width: 460px;
  margin: 1.5rem auto;
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

.article-body figure.article-audio-card {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  grid-template-rows: 2.75rem auto;
  column-gap: 0.8rem;
  align-items: center;
  padding: 0.7rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--primary) 10%, transparent);
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--primary) 5%, var(--background));
  box-shadow: 0 8px 22px color-mix(in srgb, var(--foreground) 7%, transparent);
}

.article-audio-card audio {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.article-body video {
  width: 100%;
  max-width: 100%;
  height: auto;
}

.article-body iframe {
  width: 100%;
  max-width: 100%;
  height: auto;
}
