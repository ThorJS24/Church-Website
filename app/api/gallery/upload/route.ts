import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

let client: any = null;
if (projectId && dataset && token) {
  client = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2023-05-03'
  });
}

export async function POST(request: NextRequest) {
  if (!client) {
    return NextResponse.json({ success: false, message: 'CMS not configured' }, { status: 500 });
  }
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    const uploadPromises = files.map(async (file) => {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
      });

      const galleryImage = await client.create({
        _type: 'galleryImage',
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        alt: metadata.alt || file.name,
        category: metadata.category || ['general'],
        dateTaken: metadata.dateTaken || new Date().toISOString(),
        photographer: metadata.photographer || 'Unknown',
        tags: metadata.tags || [],
        location: metadata.location || '',
        uploadedBy: metadata.uploadedBy || 'Admin',
        uploadDate: new Date().toISOString(),
        likes: 0,
        views: 0,
        featured: false,
        allowDownload: true,
        isPublic: true,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      });

      return galleryImage;
    });

    const results = await Promise.all(uploadPromises);
    
    return NextResponse.json({ 
      success: true, 
      uploaded: results.length,
      images: results 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}