export function cleanTagName(name: string): string {
  return name.trim().replace(/^#+/, '').replace(/,+$/g, '').trim();
}

export function foldTagKey(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifyTag(name: string): string {
  return cleanTagName(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTagNames(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of input) {
    const name = cleanTagName(String(value || ''));
    const slug = slugifyTag(name);
    if (!name || !slug || seen.has(slug)) continue;
    seen.add(slug);
    names.push(name);
  }

  return names;
}
