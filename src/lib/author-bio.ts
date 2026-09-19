/** Normalize author bio for safe HTML rendering (TipTap / plain text / escaped). */
export function normalizeAuthorBioHtml(raw: string | null | undefined): string {
  let html = (raw || "").trim();
  if (!html) return "";

  // Stored as escaped entities (&lt;p&gt;…) — decode once so the browser can render tags.
  if (!/<[a-z][\s\S]*>/i.test(html) && /&lt;[a-z]/i.test(html)) {
    html = html
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'");
  }

  // Plain text → paragraphs
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    const paragraphs = html
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    return paragraphs.length ? `<p>${paragraphs.join("</p><p>")}</p>` : "";
  }

  // Strip executable markup
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "");
}

export function plainTextFromBio(raw: string | null | undefined): string {
  const html = normalizeAuthorBioHtml(raw);
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
