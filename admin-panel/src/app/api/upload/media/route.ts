import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';

export const runtime = 'nodejs';

const MAX_MEDIA_SIZE = 100 * 1024 * 1024;

const MEDIA_TYPES: Record<string, { kind: 'audio' | 'video'; extension: string; contentType: string }> = {
  '.aac': { kind: 'audio', extension: '.aac', contentType: 'audio/aac' },
  '.m4a': { kind: 'audio', extension: '.m4a', contentType: 'audio/mp4' },
  '.mp3': { kind: 'audio', extension: '.mp3', contentType: 'audio/mpeg' },
  '.oga': { kind: 'audio', extension: '.oga', contentType: 'audio/ogg' },
  '.ogg': { kind: 'audio', extension: '.ogg', contentType: 'audio/ogg' },
  '.wav': { kind: 'audio', extension: '.wav', contentType: 'audio/wav' },
  '.mp4': { kind: 'video', extension: '.mp4', contentType: 'video/mp4' },
  '.ogv': { kind: 'video', extension: '.ogv', contentType: 'video/ogg' },
  '.webm': { kind: 'video', extension: '.webm', contentType: 'video/webm' },
};

const MIME_TYPES: Record<string, { kind: 'audio' | 'video'; extension: string; contentType: string }> = {
  'audio/aac': MEDIA_TYPES['.aac'],
  'audio/mp4': MEDIA_TYPES['.m4a'],
  'audio/mpeg': MEDIA_TYPES['.mp3'],
  'audio/ogg': MEDIA_TYPES['.ogg'],
  'audio/wav': MEDIA_TYPES['.wav'],
  'audio/x-wav': MEDIA_TYPES['.wav'],
  'audio/webm': { kind: 'audio', extension: '.webm', contentType: 'audio/webm' },
  'video/mp4': MEDIA_TYPES['.mp4'],
  'video/ogg': MEDIA_TYPES['.ogv'],
  'video/webm': MEDIA_TYPES['.webm'],
};

function getS3Client() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!accountId || !accessKey || !secretKey) {
    throw new Error('Les identifiants Cloudflare R2 ne sont pas configurés.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const filename = typeof body.filename === 'string' ? body.filename : '';
    const extension = filename.match(/\.[^.]+$/)?.[0].toLowerCase() || '';
    const fileType = typeof body.contentType === 'string'
      ? body.contentType.split(';')[0].trim().toLowerCase()
      : '';
    const detectedType = MIME_TYPES[fileType];
    const extensionType = MEDIA_TYPES[extension];
    const kind = body.kind === 'audio' || body.kind === 'video' ? body.kind : null;
    const size = Number(body.size);
    const inferredType =
      kind === 'audio' && extension === '.webm'
        ? MIME_TYPES['audio/webm']
        : kind === 'video' && extension === '.ogg'
          ? MIME_TYPES['video/ogg']
          : extensionType;

    if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_MEDIA_SIZE) {
      return NextResponse.json({ error: 'Le fichier doit peser entre 1 octet et 100 Mo.' }, { status: 400 });
    }
    if (!kind || (detectedType && detectedType.kind !== kind) || (!detectedType && inferredType?.kind !== kind)) {
      return NextResponse.json({ error: 'Format audio ou vidéo non pris en charge.' }, { status: 400 });
    }

    const mediaType = detectedType || inferredType;
    const key = `Blog_media/${randomUUID()}${mediaType.extension}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
      Key: key,
      ContentType: mediaType.contentType,
    });
    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 900 });

    return NextResponse.json({
      uploadUrl,
      url: `https://media.malakinfo.com/${key}`,
      contentType: mediaType.contentType,
    });
  } catch (error) {
    console.error('[media upload signing]', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Impossible de préparer le transfert du média.',
    }, { status: 500 });
  }
}
