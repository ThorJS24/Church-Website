import type { MetadataRoute } from 'next';
import { getBlogPosts, getEvents, getSermons } from '@/lib/content';

const BASE_URL = 'https://salempbc.in';

const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/about/beliefs', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about/pastors', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/about/branches', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/about/history', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/services', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/sermons', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/events', changeFrequency: 'daily', priority: 0.8 },
  { path: '/ministries', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/small-groups', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/gallery', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/give', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/prayer', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/testimonials', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.7 },
  { path: '/community', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

/** Dynamic sitemap — replaces the old hand-maintained static sitemap.xml,
 * which had fixed lastmod dates and couldn't include blog posts (or
 * anything else added after it was written). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(p => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts(200);
    blogEntries = posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
  } catch (error) {
    // A Firestore hiccup here shouldn't take the whole sitemap down —
    // search engines still get the static pages.
    console.error('Sitemap: failed to load blog posts:', error);
  }

  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await getEvents();
    eventEntries = events.map(event => ({
      url: `${BASE_URL}/events/${event.id}`,
      lastModified: new Date(event.startDate),
      changeFrequency: 'weekly',
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap: failed to load events:', error);
  }

  let sermonEntries: MetadataRoute.Sitemap = [];
  try {
    const sermons = await getSermons(200);
    sermonEntries = sermons.map(sermon => ({
      url: `${BASE_URL}/sermons/${sermon.id}`,
      lastModified: new Date(sermon.date),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Sitemap: failed to load sermons:', error);
  }

  return [...staticEntries, ...blogEntries, ...eventEntries, ...sermonEntries];
}
