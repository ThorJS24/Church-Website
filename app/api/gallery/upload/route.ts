import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import cloudinary from '@/lib/cloudinary';

// Admin-authored uploads are pre-approved (moderationStatus: 'approved') —
// unlike the public submission path (app/api/gallery/submit), there's
// nothing to moderate here since the actor is already admin+.
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const metadata = JSON.parse((formData.get('metadata') as string) || '{}');

    const uploaded = await withAudit(
      authResult.user,
      request,
      { action: 'gallery.upload', targetType: 'galleryImages', targetId: 'batch' },
      async () => {
        const results = await Promise.all(
          files.map(async (file) => {
            const bytes = Buffer.from(await file.arrayBuffer());
            const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
            const asset = await cloudinary.uploader.upload(dataUri, { folder: 'gallery' });

            const docRef = await getAdminDb().collection('galleryImages').add({
              title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
              description: metadata.description || '',
              imageUrl: asset.secure_url,
              category: metadata.category || 'general',
              dateTaken: metadata.dateTaken || new Date().toISOString(),
              photographer: metadata.photographer || 'Unknown',
              tags: metadata.tags || [],
              location: metadata.location || '',
              eventId: metadata.eventId || null,
              uploadedBy: authResult.user.uid,
              uploadDate: FieldValue.serverTimestamp(),
              likes: 0,
              views: 0,
              featured: false,
              allowDownload: true,
              isPublic: true,
              moderationStatus: 'approved',
            });

            return { id: docRef.id, imageUrl: asset.secure_url };
          })
        );
        return { after: { count: results.length, ids: results.map(r => r.id) }, result: results };
      }
    );

    return NextResponse.json({ success: true, uploaded: uploaded.length, images: uploaded });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
