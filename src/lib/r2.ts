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

export async function uploadImageToR2(file: File, folder: string = 'Images_blogs'): Promise<string> {
  try {
    console.log('[R2] Starting upload process for file:', file.name, 'size:', file.size, 'type:', file.type);
    console.log('[R2] R2 credentials check:', {
      hasAccountId: !!process.env.R2_ACCOUNT_ID,
      hasAccessKeyId: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET_NAME || 'malakininfo'
    });

    const r2 = getR2Client();
    console.log('[R2] R2 client created successfully');
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    console.log('[R2] Generated key:', key);

    const fileBuffer = await file.arrayBuffer();
    console.log('[R2] File buffer created, size:', fileBuffer.byteLength);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
      Key: key,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
    });

    console.log('[R2] Sending PutObjectCommand to R2...');
    await r2.send(command);
    console.log('[R2] Upload successful');

    // Return the public URL
    const url = `https://media.malakinfo.com/${key}`;
    console.log('[R2] Returning URL:', url);
    return url;
  } catch (error) {
    console.error('[R2] Upload failed with error:', error);
    console.error('[R2] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // Fallback: convert to base64 data URL (Node.js compatible)
    console.log('[R2] Falling back to base64');
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const base64data = `data:${file.type};base64,${buffer.toString('base64')}`;
    console.log('[R2] Base64 fallback completed, length:', base64data.length);
    return base64data;
  }
}

export async function deleteImageFromR2(key: string): Promise<void> {
  try {
    const r2 = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
      Key: key,
    });

    await r2.send(command);
  } catch (error) {
    console.error('R2 delete failed:', error);
    // Silently fail for now
  }
}