import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToR2 } from '@/lib/r2';

export const runtime = 'nodejs';

function hasUsableR2Credentials() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  return Boolean(accountId && accessKey && secretKey && secretKey.length > 8);
}

async function uploadViaMainSite(file: File, folder: string) {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (!mainSiteUrl) {
    throw new Error('NEXT_PUBLIC_MAIN_SITE_URL manquant');
  }

  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('folder', folder);

  const response = await fetch(`${mainSiteUrl.replace(/\/$/, '')}/api/upload`, {
    method: 'POST',
    body: uploadFormData,
  });

  const data = await response.json().catch(() => ({} as Record<string, unknown>));
  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : typeof data.details === 'string'
          ? data.details
          : `Upload site principal échoué (${response.status})`,
    );
  }

  const url = typeof data.url === 'string' ? data.url : '';
  if (!url || url.startsWith('data:')) {
    throw new Error(
      'Le site principal n’a pas renvoyé d’URL HTTPS Cloudflare. Vérifiez les credentials R2 du site principal.',
    );
  }

  return url;
}

function inferFileType(file: File) {
  const name = file.name.toLowerCase();
  const mime = file.type || '';

  if (mime) return mime;

  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.match(/\.(jpe?g)$/)) return 'image/jpeg';
  if (name.endsWith('.mp3') || name.endsWith('.mpeg')) return 'audio/mpeg';
  if (name.endsWith('.wav')) return 'audio/wav';
  if (name.endsWith('.ogg')) return 'audio/ogg';
  if (name.endsWith('.m4a')) return 'audio/mp4';
  if (name.endsWith('.aac')) return 'audio/aac';
  if (name.endsWith('.webm')) return 'audio/webm';

  return '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'Images_blogs';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
      'audio/mp4',
      'audio/x-m4a',
    ];

    const inferredType = inferFileType(file);

    if (inferredType && !allowedTypes.includes(inferredType)) {
      return NextResponse.json(
        {
          error:
            'Type de fichier invalide. Formats acceptés : JPEG, PNG, WebP, GIF, MP3, WAV, OGG, M4A, AAC, WEBM.',
        },
        { status: 400 },
      );
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 25 Mo).' }, { status: 400 });
    }

    const errors: string[] = [];

    if (hasUsableR2Credentials()) {
      try {
        const url = await uploadImageToR2(file, folder);
        if (url && !url.startsWith('data:')) {
          return NextResponse.json({ success: true, url, method: 'r2-direct' });
        }
        errors.push('R2 direct a renvoyé une URL invalide');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[admin upload] R2 direct failed:', message);
        errors.push(`R2 direct: ${message}`);
      }
    } else {
      errors.push('Credentials R2 absentes ou incomplètes sur le panel (vérifiez R2_SECRET_ACCESS_KEY)');
    }

    try {
      const url = await uploadViaMainSite(file, folder);
      return NextResponse.json({
        success: true,
        url,
        method: 'proxy-main-site',
        warnings: errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[admin upload] Main site proxy failed:', message);
      errors.push(`Proxy site: ${message}`);
    }

    return NextResponse.json(
      {
        error:
          'Upload impossible : Access Denied sur R2. Dans Cloudflare → R2 → Manage API Tokens, créez un token avec permission « Object Read & Write » (pas Read seul), puis mettez à jour R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY sur dash-malakin ET malakinfo, et redéployez.',
        details: errors.join(' | '),
      },
      { status: 500 },
    );
  } catch (error) {
    console.error('[admin upload] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Échec de l’upload',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

