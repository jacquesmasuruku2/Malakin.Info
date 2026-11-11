declare module 'sanitize-html' {
  type SanitizeOptions = {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    allowedSchemesAppliedToAttributes?: string[];
  };

  export default function sanitizeHtml(html: string, options?: SanitizeOptions): string;
}
