import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

const MAX_LIMIT = 50;

// 30/hour/IP: live search-as-you-type (SearchModal debounces at 300ms) can
// fire several requests per session under normal use.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// The rate limit above caps how often a caller can hit this route, but not
// what each call costs — every request still read all four collections in
// full regardless of size. SCAN_LIMIT bounds the read itself, independent
// of rate limiting, so the cost per call can't grow unboundedly as content
// accumulates over the years. No orderBy paired with it deliberately: an
// orderBy on a field some older/admin-entered docs might not have would
// silently exclude those docs from the scan entirely, which is worse for a
// search feature than scanning a plain, unordered slice.
const SCAN_LIMIT = 200;

function matches(haystack: string | undefined, needle: string): boolean {
  return !!haystack && haystack.toLowerCase().includes(needle);
}

export async function GET(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`search_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { query: '', totalResults: 0, results: {}, error: 'Too many searches. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 20 : rawLimit, 1), MAX_LIMIT);

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const needle = query.toLowerCase();

    const db = getAdminDb();
    const [sermonsSnap, eventsSnap, announcementsSnap, gallerySnap] = await Promise.all([
      db.collection('sermons').limit(SCAN_LIMIT).get(),
      db.collection('events').limit(SCAN_LIMIT).get(),
      db.collection('announcements').limit(SCAN_LIMIT).get(),
      db.collection('galleryImages').limit(SCAN_LIMIT).get(),
    ]);

    const sermons = sermonsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((s: any) => matches(s.title, needle) || matches(s.description, needle))
      .slice(0, limit);

    const events = eventsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((e: any) => matches(e.title, needle) || matches(e.description, needle))
      .slice(0, limit);

    const announcements = announcementsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((a: any) => matches(a.title, needle) || matches(a.content, needle))
      .slice(0, limit);

    const gallery = gallerySnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((g: any) => matches(g.title, needle) || matches(g.description, needle))
      .slice(0, limit);

    const totalResults = sermons.length + events.length + announcements.length + gallery.length;

    return NextResponse.json({
      query,
      totalResults,
      results: { sermons, events, announcements, gallery },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      query: '',
      totalResults: 0,
      results: {},
    });
  }
}
