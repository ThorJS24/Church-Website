import { NextResponse } from 'next/server';
import { getSermons, getSiteSettings } from '@/lib/content';

const BASE_URL = 'https://salempbc.in';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Podcast RSS feed (submittable to Spotify/Apple Podcasts) — built from
 * sermons that have an `audioUrl` set. Sermons without one (the majority,
 * historically — this site mainly links YouTube) are skipped rather than
 * included with a broken/missing enclosure, since a podcast app needs a
 * real direct audio file per episode, not a video page link. */
export async function GET() {
  const [sermons, settings] = await Promise.all([getSermons(100), getSiteSettings()]);
  const episodes = sermons.filter(s => !!s.audioUrl);

  const churchName = settings?.churchName || 'Salem Primitive Baptist Church';
  const description = settings?.tagline || 'Sermons from Salem Primitive Baptist Church';
  const coverImage = `${BASE_URL}/icons/icon-144x144.png`;

  const items = episodes.map(s => `
    <item>
      <title>${escapeXml(s.title)}</title>
      <description>${escapeXml(s.description || s.subtitle || '')}</description>
      <pubDate>${new Date(s.date).toUTCString()}</pubDate>
      <enclosure url="${escapeXml(s.audioUrl!)}" type="audio/mpeg" length="0" />
      <guid isPermaLink="false">${escapeXml(s.id)}</guid>
      ${s.speakerName ? `<itunes:author>${escapeXml(s.speakerName)}</itunes:author>` : ''}
      ${s.duration ? `<itunes:duration>${s.duration * 60}</itunes:duration>` : ''}
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(churchName)} — Sermons</title>
    <link>${BASE_URL}/sermons</link>
    <language>en-us</language>
    <description>${escapeXml(description)}</description>
    <itunes:image href="${coverImage}" />
    <itunes:category text="Religion &amp; Spirituality" />
    <itunes:explicit>false</itunes:explicit>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
