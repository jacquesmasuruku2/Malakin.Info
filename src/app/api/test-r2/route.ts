import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Testing R2 upload with file:', file.name, file.type, file.size);
    
    const imageUrl = await uploadImageToR2(file, 'test-uploads');

    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      message: 'R2 upload test successful'
    });
  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json(
      { error: 'R2 upload test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}