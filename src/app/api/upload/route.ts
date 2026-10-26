import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dashboard.malakinfo.com',
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'Images_blogs';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

    const name = (file.name || '').toLowerCase();
    const inferredType =
      file.type ||
      (name.endsWith('.png')
        ? 'image/png'
        : name.endsWith('.webp')
          ? 'image/webp'
          : name.endsWith('.gif')
            ? 'image/gif'
            : name.match(/\.(jpe?g)$/)
              ? 'image/jpeg'
              : name.endsWith('.mp3') || name.endsWith('.mpeg')
                ? 'audio/mpeg'
                : name.endsWith('.wav')
                  ? 'audio/wav'
                  : name.endsWith('.ogg')
                    ? 'audio/ogg'
                    : name.endsWith('.m4a')
                      ? 'audio/mp4'
                      : name.endsWith('.aac')
                        ? 'audio/aac'
                        : name.endsWith('.webm')
                          ? 'audio/webm'
                          : '');

    if (inferredType && !allowedTypes.includes(inferredType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, MP3, WAV, OGG, M4A, AAC, and WEBM are allowed.' },
        { status: 400 },
      );
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    console.log('[Upload API] Uploading file from origin:', origin);
    console.log('[Upload API] File details:', { name: file.name, type: file.type, size: file.size });
    console.log('[Upload API] Folder:', folder);

    const imageUrl = await uploadImageToR2(file, folder);
    console.log('[Upload API] Upload successful, URL:', imageUrl);

    if (!imageUrl || imageUrl.startsWith('data:')) {
      return NextResponse.json(
        {
          error:
            'Upload R2 a échoué : aucune URL HTTPS publique. Vérifiez R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY et R2_BUCKET_NAME.',
        },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      url: imageUrl,
      method: 'r2',
    });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    }

    return response;
  } catch (error) {
    console.error('[Upload API] Error uploading file:', error);
    console.error('[Upload API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dashboard.malakinfo.com',
  ];

  const response = new NextResponse(null, { status: 200 });

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return response;
}

