import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'Images_blogs';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Prefer direct R2 upload from the admin panel (same credentials as the site).
    if (
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
    ) {
      const url = await uploadImageToR2(file, folder);
      if (url.startsWith('data:')) {
        return NextResponse.json(
          { error: 'Upload R2 a renvoyé une image base64, refusée pour les emails.' },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true, url, method: 'r2' });
    }

    const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', folder);

    const response = await fetch(`${mainSiteUrl.replace(/\/$/, '')}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Upload failed' },
        { status: response.status },
      );
    }

    if (!data?.url || String(data.url).startsWith('data:')) {
      return NextResponse.json(
        {
          error:
            'L’upload n’a pas produit d’URL HTTPS Cloudflare. Vérifiez les credentials R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, url: data.url, method: data.method || 'proxy' });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
