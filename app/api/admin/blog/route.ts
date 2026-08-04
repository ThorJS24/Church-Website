import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

/** Blog posts use their slug as the Firestore doc id — unlike the generic
 * `/api/admin/content/[type]` collections (auto IDs) — so uniqueness is
 * free and `/blog/[slug]` can `getDoc` directly instead of querying. That's
 * also why blog gets its own routes rather than joining the allowlist. */
async function uniqueSlug(base: string, excludeSlug?: string): Promise<string> {
  const db = getAdminDb();
  let candidate = base || 'post';
  let n = 1;
  while (true) {
    if (candidate === excludeSlug) return candidate;
    const doc = await db.collection('blogPosts').doc(candidate).get();
    if (!doc.exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('blogPosts').get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error listing blog posts:', error);
    return NextResponse.json({ success: false, message: 'Failed to list blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ success: false, message: 'Title and content are required.' }, { status: 400 });
    }

    const slug = await uniqueSlug(slugify(body.slug || body.title));
    const now = new Date().toISOString();
    const data = { ...body, slug, date: body.date || now, createdAt: now, updatedAt: now };

    await withAudit(
      authResult.user,
      request,
      { action: 'blog.create', targetType: 'blogPosts', targetId: slug },
      async () => {
        await getAdminDb().collection('blogPosts').doc(slug).set(data);
        return { after: data, result: null };
      }
    );

    return NextResponse.json({ success: true, id: slug });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ success: false, message: 'Failed to create blog post' }, { status: 500 });
  }
}
