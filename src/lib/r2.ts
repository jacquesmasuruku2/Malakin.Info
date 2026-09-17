import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const getR2Client = () => {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials are not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
  console.log('[R2] Starting upload process for file:', file.name, 'size:', file.size, 'type:', file.type);

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error(
      'Upload Cloudflare R2 impossible : credentials manquantes. Les images base64 ne sont pas acceptées pour les emails.',
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadBufferToR2(fileBuffer, file.type || 'image/jpeg', folder, file.name);
  console.log('[R2] Upload successful, URL:', url);
  return url;
}

/** Convert a data:image/...;base64,... string into a public HTTPS media URL. */
export async function uploadDataUrlToR2(
  dataUrl: string,
  folder: string = 'Images_blogs',
): Promise<string> {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i.exec(dataUrl.trim());
  if (!match) {
    throw new Error('URL data image invalide');
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) {
    throw new Error('Image base64 vide');
  }

  return uploadBufferToR2(buffer, contentType, folder);
}

/** If value is a data URL, upload it to R2; otherwise return as-is. */
export async function ensurePublicImageUrl(
  value: string | null | undefined,
  folder: string = 'Images_blogs',
): Promise<string | null> {
  if (!value) return null;
  if (!isDataImageUrl(value)) return value;
  return uploadDataUrlToR2(value, folder);
}

/** Replace every data:image src in HTML with uploaded HTTPS URLs. */
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
      const publicUrl = await uploadDataUrlToR2(dataUrl, folder);
      cache.set(dataUrl, publicUrl);
    } catch (error) {
      console.error('[R2] Failed to convert embedded data image:', error);
      cache.set(dataUrl, '');
    }
  }

  for (const [dataUrl, publicUrl] of cache) {
    result = result.split(dataUrl).join(publicUrl);
  }

  return result;
}

export async function deleteImageFromR2(key: string): Promise<void> {
  try {
    const r2 = getR2Client();
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
        Key: key,
      }),
    );
  } catch (error) {
    console.error('R2 delete failed:', error);
  }
}
