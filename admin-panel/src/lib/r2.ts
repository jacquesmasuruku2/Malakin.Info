import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function hasR2Credentials() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  return Boolean(accountId && accessKey && secretKey && secretKey.length > 8);
}

const getR2Client = () => {
  if (!hasR2Credentials()) {
    throw new Error('R2 credentials are not configured on the admin panel');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID!.trim()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    },
  });
};

function extensionFromMime(mime: string) {
  const subtype = mime.split('/')[1]?.toLowerCase() || 'png';
  if (subtype === 'jpeg') return 'jpg';
  return subtype.replace(/[^a-z0-9]/g, '') || 'png';
}

export function isDataImageUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);
}

export async function uploadBufferToR2(
  buffer: Buffer,
  contentType: string,
  folder: string = 'Images_blogs',
  originalName?: string,
): Promise<string> {
  const r2 = getR2Client();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension =
    originalName?.split('.').pop()?.toLowerCase() || extensionFromMime(contentType);
  const fileName = `${timestamp}-${randomString}.${fileExtension}`;
  const key = `${folder}/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `https://media.malakinfo.com/${key}`;
}

export async function uploadImageToR2(file: File, folder: string = 'Images_blogs'): Promise<string> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToR2(fileBuffer, file.type || 'image/jpeg', folder, file.name);
}

export async function uploadDataUrlToR2(
  dataUrl: string,
  folder: string = 'Images_blogs',
): Promise<string> {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i.exec(dataUrl.trim());
  if (!match) throw new Error('URL data image invalide');
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) throw new Error('Image base64 vide');
  return uploadBufferToR2(buffer, contentType, folder);
}

async function uploadViaMainSite(file: File, folder: string): Promise<string> {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (!mainSiteUrl) {
    throw new Error('NEXT_PUBLIC_MAIN_SITE_URL manquant pour uploader l’image');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(`${mainSiteUrl.replace(/\/$/, '')}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.url || String(data.url).startsWith('data:')) {
    throw new Error(data?.error || 'Upload image échoué (pas d’URL HTTPS)');
  }

  return String(data.url);
}

export async function ensurePublicImageUrl(
  value: string | null | undefined,
  folder: string = 'Images_blogs',
): Promise<string | null> {
  if (!value) return null;
  if (!isDataImageUrl(value)) return value;

  if (hasR2Credentials()) {
    return uploadDataUrlToR2(value, folder);
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i.exec(value.trim());
  if (!match) return null;
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = extensionFromMime(contentType);
  const file = new File([buffer], `upload.${ext}`, { type: contentType });
  return uploadViaMainSite(file, folder);
}

export async function replaceDataImagesInHtml(
  html: string,
  folder: string = 'Images_blogs',
): Promise<string> {
  if (!html || !/data:image\//i.test(html)) return html;

  const matches = [...html.matchAll(/src=(["'])(data:image\/[a-zA-Z0-9.+-]+;base64,[^"']+)\1/gi)];
  if (!matches.length) return html;

  let result = html;
  const cache = new Map<string, string>();

  for (const match of matches) {
    const dataUrl = match[2];
    if (cache.has(dataUrl)) continue;
    try {
      const publicUrl = (await ensurePublicImageUrl(dataUrl, folder)) || '';
      cache.set(dataUrl, publicUrl);
    } catch (error) {
      console.error('[admin R2] Failed to convert embedded data image:', error);
      cache.set(dataUrl, '');
    }
  }

  for (const [dataUrl, publicUrl] of cache) {
    result = result.split(dataUrl).join(publicUrl);
  }

  return result;
}

export async function ensureArticlePublicImages<T extends {
  mainImageUrl?: string | null;
  additionalImages?: unknown;
  content?: unknown;
}>(payload: T): Promise<T> {
  const mainImageUrl = await ensurePublicImageUrl(payload.mainImageUrl);

  let additionalImages = payload.additionalImages;
  if (Array.isArray(additionalImages)) {
    additionalImages = await Promise.all(
      additionalImages.map(async (item) => {
        if (typeof item !== 'string') return item;
        return (await ensurePublicImageUrl(item)) || item;
      }),
    );
  }

  let content = payload.content;
  if (typeof content === 'string' && /data:image\//i.test(content)) {
    content = await replaceDataImagesInHtml(content);
  }

  return {
    ...payload,
    mainImageUrl,
    additionalImages,
    content,
  };
}
