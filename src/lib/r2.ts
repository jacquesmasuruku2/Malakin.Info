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
    const r2 = getR2Client();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'malakininfo',
      Key: key,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
    });

    await r2.send(command);

    // Return the public URL
    return `https://media.malakinfo.com/${key}`;
  } catch (error) {
    console.error('R2 upload failed, falling back to base64:', error);
    // Fallback: convert to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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