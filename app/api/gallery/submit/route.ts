import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';
import cloudinary from '@/lib/cloudinary';

// Kept well under both the platform's serverless body-size cap (Vercel's
// default is ~4.5MB) and Next.js's own dev-server body truncation (10MB,
// which corrupts the multipart parse rather than failing cleanly) — there
// must be real headroom between this limit and either of those, or a
// legitimate large-but-valid photo hits framework-level truncation before
// this validation ever runs, producing a confusing 500 instead of a clean
// "file too large" response.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 5 submissions per IP per hour

// Public gallery submission — anyone can submit a photo, but it stays
// invisible (moderationStatus: 'pending') until a moderator approves it.
// Distinct from /api/gallery/upload, which is the admin-authored path and
// requires the admin role (its uploads are pre-approved).
export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`gallery-submit_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      // A body large/malformed enough to break multipart parsing lands
      // here — most commonly an oversized file blowing past a platform
      // body-size cap before our own MAX_FILE_BYTES check ever runs.
      // Still a clean 400, not a generic 500.
      return NextResponse.json({ success: false, error: 'File too large or upload was malformed (max 4MB)' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const submitterName = (formData.get('submitterName') as string) || 'Anonymous';
    const eventId = (formData.get('eventId') as string) || null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'File must be a JPEG, PNG, WebP, or GIF image' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 4MB)' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
    const asset = await cloudinary.uploader.upload(dataUri, { folder: 'gallery-submissions' });

    const docRef = await getAdminDb().collection('galleryImages').add({
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      imageUrl: asset.secure_url,
      category: 'general',
      dateTaken: new Date().toISOString(),
      photographer: submitterName,
      tags: [],
      location: '',
      eventId,
      uploadedBy: null,
      uploadDate: FieldValue.serverTimestamp(),
      likes: 0,
      views: 0,
      featured: false,
      allowDownload: false,
      isPublic: true,
      moderationStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Thanks! Your photo will appear once a moderator reviews it.',
    });
  } catch (error) {
    console.error('Gallery submission error:', error);
    return NextResponse.json({ success: false, error: 'Submission failed' }, { status: 500 });
  }
}
