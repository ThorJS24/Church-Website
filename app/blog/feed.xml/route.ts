import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/content';

const SITE_URL = 'https://salempbc.in';

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getBlogPosts(50);

  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid>${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.authorName ? `<author>${escapeXml(post.authorName)}</author>` : ''}
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      <description>${escapeXml(post.excerpt || post.content.slice(0, 300))}</description>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Salem Primitive Baptist Church — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Reflections, updates, and stories from Salem Primitive Baptist Church</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
