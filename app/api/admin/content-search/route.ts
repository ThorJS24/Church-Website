import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

// Maps a content-search "type" (matches the admin Content page's tab keys)
// to its Firestore collection, the field to treat as the title, and the
// fields to full-text match against. Kept separate from the CRUD routes'
// COLLECTIONS maps since this one also needs to know which fields to
// search/display, not just where the docs live.
const SEARCHABLE: Record<string, { collection: string; titleField: string; matchFields: string[]; tab: string }> = {
  sermons: { collection: 'sermons', titleField: 'title', matchFields: ['title', 'description', 'speakerName', 'seriesTitle', 'scripture'], tab: 'sermons' },
  events: { collection: 'events', titleField: 'title', matchFields: ['title', 'shortDescription', 'location'], tab: 'events' },
  pastors: { collection: 'pastors', titleField: 'name', matchFields: ['name', 'bio', 'title'], tab: 'pastors' },
  ministries: { collection: 'ministries', titleField: 'title', matchFields: ['title', 'description'], tab: 'ministries' },
  announcements: { collection: 'announcements', titleField: 'title', matchFields: ['title', 'content'], tab: 'announcements' },
  blog: { collection: 'blogPosts', titleField: 'title', matchFields: ['title', 'excerpt', 'content'], tab: 'blog' },
  smallGroups: { collection: 'smallGroups', titleField: 'name', matchFields: ['name', 'description'], tab: 'small-groups' },
  testimonials: { collection: 'testimonials', titleField: 'authorName', matchFields: ['authorName', 'content'], tab: 'testimonials' },
  resources: { collection: 'resources', titleField: 'title', matchFields: ['title', 'description'], tab: 'resources' },
  redirects: { collection: 'redirects', titleField: 'fromPath', matchFields: ['fromPath', 'toPath'], tab: 'redirects' },
  series: { collection: 'series', titleField: 'title', matchFields: ['title', 'description'], tab: 'series' },
  speakers: { collection: 'speakers', titleField: 'name', matchFields: ['name', 'bio'], tab: 'speakers' },
};

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const db = getAdminDb();
    const entries = Object.entries(SEARCHABLE);
    const snapshots = await Promise.all(entries.map(([, cfg]) => db.collection(cfg.collection).get()));

    const results: Array<{ id: string; type: string; tab: string; title: string; snippet: string }> = [];
    entries.forEach(([type, cfg], i) => {
      snapshots[i].docs.forEach((doc) => {
        const data = doc.data();
        const haystack = cfg.matchFields.map((f) => String(data[f] ?? '')).join(' • ').toLowerCase();
        if (!haystack.includes(q)) return;
        const title = String(data[cfg.titleField] ?? doc.id);
        const snippetField = cfg.matchFields.find((f) => f !== cfg.titleField && typeof data[f] === 'string' && data[f].toLowerCase().includes(q));
        const snippetSource = snippetField ? data[snippetField] : undefined;
        results.push({
          id: doc.id,
          type,
          tab: cfg.tab,
          title,
          snippet: typeof snippetSource === 'string' ? snippetSource.slice(0, 120) : '',
        });
      });
    });

    // Title matches first, then by type, so results feel deliberately
    // ordered rather than dumped in collection-scan order.
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1;
      const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1;
      if (aTitle !== bTitle) return aTitle - bTitle;
      return a.type.localeCompare(b.type);
    });

    return NextResponse.json({ success: true, results: results.slice(0, 30) });
  } catch (error) {
    console.error('Error running content search:', error);
    return NextResponse.json({ success: false, message: 'Search failed' }, { status: 500 });
  }
}
