import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { FieldValue } from 'firebase-admin/firestore';
import cloudinary from '@/lib/cloudinary';

/** Central asset library — upload once in /admin/media, reuse the URL
 * across sermons/events/gallery/pastors instead of re-uploading per field. */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('mediaLibrary').orderBy('uploadedAt', 'desc').get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error listing media:', error);
    return NextResponse.json({ success: false, message: 'Failed to list media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const tagsRaw = (formData.get('tags') as string) || '';
    const folderRaw = (formData.get('folder') as string) || '';
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const folder = folderRaw.trim() || null;

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: 'No files provided' }, { status: 400 });
    }

    // Existing content hashes, fetched once up front, so every file in this
    // batch can be checked for a duplicate-of-an-existing-asset without a
    // query per file — the library is small enough for one full scan.
    const existingSnap = await getAdminDb().collection('mediaLibrary').select('contentHash', 'fileName').get();
    const hashToExisting = new Map<string, { id: string; fileName: string }>();
    existingSnap.docs.forEach((d) => {
      const hash = d.data().contentHash;
      if (hash) hashToExisting.set(hash, { id: d.id, fileName: d.data().fileName });
    });

    const uploaded = await withAudit(
      authResult.user,
      request,
      { action: 'media.upload', targetType: 'mediaLibrary', targetId: 'batch' },
      async () => {
        const results = await Promise.all(
          files.map(async (file) => {
            const bytes = Buffer.from(await file.arrayBuffer());
            const contentHash = createHash('sha256').update(bytes).digest('hex');
            const duplicateOf = hashToExisting.get(contentHash) ?? null;
            const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
            // 'auto' rather than the default 'image' — the library also
            // holds PDFs/docs for the Resources section, which Cloudinary
            // stores as 'raw' assets; 'auto' picks the right type per file
            // instead of rejecting anything that isn't an image.
            const asset = await cloudinary.uploader.upload(dataUri, { folder: 'media-library', resource_type: 'auto' });

            const docRef = await getAdminDb().collection('mediaLibrary').add({
              url: asset.secure_url,
              publicId: asset.public_id,
              fileName: file.name,
              mimeType: file.type,
              size: file.size,
              tags,
              folder,
              contentHash,
              duplicateOfId: duplicateOf?.id ?? null,
              altText: '',
              copyright: '',
              deletedAt: null,
              uploadedBy: authResult.user.uid,
              uploadedByEmail: authResult.user.email,
              uploadedAt: FieldValue.serverTimestamp(),
            });

            return { id: docRef.id, url: asset.secure_url, duplicateOfFileName: duplicateOf?.fileName ?? null };
          })
        );
        return { after: { count: results.length, ids: results.map(r => r.id) }, result: results };
      }
    );

    return NextResponse.json({ success: true, uploaded: uploaded.length, items: uploaded });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
