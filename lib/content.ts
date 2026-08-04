// Public content-fetching layer backed by Firestore. Replaces the old
// Sanity CMS integration (lib/sanity*.ts) — Sanity's relational/portable-text
// model was dropped in favor of flat Firestore documents that are simpler
// to read, write, and eventually edit through an admin panel (Phase 2).
// All collections here are public-read per firestore.rules; writes are
// staff/admin-only and happen through the admin panel or Admin SDK routes,
// never from these client-side getters.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

function withId<T>(snap: { id: string; data: () => any }): T {
  return { id: snap.id, ...snap.data() } as T;
}

/**
 * A doc with no `status` field is legacy/always-on content (published).
 * `status: 'draft'` hides it from public reads unless `publishAt` has
 * already passed — scheduled publishing is computed here, at read time,
 * rather than by a cron job flipping the field, since there's no
 * scheduler infrastructure in this deployment and this is simpler and
 * can't silently miss a run.
 */
function isEffectivelyPublished(data: Record<string, any>): boolean {
  if (data.status !== 'draft') return true;
  return !!data.publishAt && new Date(data.publishAt).getTime() <= Date.now();
}

/** Shared by every content interface below — set by the admin panel's Status field. */
export interface Publishable {
  status?: 'draft' | 'published';
  publishAt?: string;
}

export interface Sermon extends Publishable {
  id: string;
  title: string;
  subtitle?: string;
  speakerName?: string;
  seriesTitle?: string;
  date: string;
  youtubeUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  duration?: number;
  scripture?: string;
  description?: string;
  featured?: boolean;
}

export async function getSermons(max = 20): Promise<Sermon[]> {
  // Draft/scheduled filtering happens after the query, not in it — a
  // Firestore inequality on `status` would force `orderBy('status')` ahead
  // of `orderBy('date')`, breaking the newest-first order this depends on.
  // Trade-off: if any of the `max` most recent sermons are drafts, the
  // public list returns fewer than `max` rather than backfilling — fine at
  // this collection's size, and keeps this a single, cheap, uncomposited read.
  const snap = await getDocs(query(collection(db, 'sermons'), orderBy('date', 'desc'), fbLimit(max)));
  return snap.docs.map(d => withId<Sermon>(d)).filter(isEffectivelyPublished);
}

export async function getSeriesList(): Promise<{ id: string; title: string }[]> {
  const snap = await getDocs(collection(db, 'series'));
  return snap.docs.map(d => withId<{ id: string; title: string } & Publishable>(d)).filter(isEffectivelyPublished);
}

export async function getSpeakersList(): Promise<{ id: string; name: string }[]> {
  const snap = await getDocs(collection(db, 'speakers'));
  return snap.docs.map(d => withId<{ id: string; name: string } & Publishable>(d)).filter(isEffectivelyPublished);
}

export interface Pastor extends Publishable {
  id: string;
  name: string;
  title: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  yearsOfService?: number;
  ordainedDate?: string;
  specialties?: string[];
}

export async function getPastors(): Promise<Pastor[]> {
  const snap = await getDocs(collection(db, 'pastors'));
  return snap.docs.map(d => withId<Pastor>(d)).filter(isEffectivelyPublished);
}

export interface EventItem extends Publishable {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  galleryDescription?: string;
  startDate: string;
  endDate?: string;
  location: string;
  address?: string;
  category: string;
  imageUrl?: string;
  organizerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  registrationRequired?: boolean;
  registrationUrl?: string;
  maxAttendees?: number;
  cost?: number;
  tags?: string[];
  featured?: boolean;
  recurring?: boolean;
  recurrencePattern?: string;
  isPublic?: boolean;
  showInGallery?: boolean;
  youtubeUrl?: string;
}

export async function getEvents(): Promise<EventItem[]> {
  const snap = await getDocs(collection(db, 'events'));
  return snap.docs.map(d => withId<EventItem>(d)).filter(isEffectivelyPublished);
}

export interface ServiceTime extends Publishable {
  id: string;
  title: string;
  time: string;
  location: string;
  description?: string;
}

export async function getServiceTimes(): Promise<ServiceTime[]> {
  const snap = await getDocs(collection(db, 'services'));
  return snap.docs.map(d => withId<ServiceTime>(d)).filter(isEffectivelyPublished);
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  photographer?: string;
  dateTaken: string;
  eventId?: string;
  isPublic?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  likes?: number;
  views?: number;
  category?: string;
  tags?: string[];
  location?: string;
  uploadedBy?: string | null;
  allowDownload?: boolean;
  featured?: boolean;
}

export interface EventGallery extends EventItem {
  photos: GalleryPhoto[];
}

/** Public events that have public gallery photos, grouped by event. */
export async function getEventGalleries(): Promise<EventGallery[]> {
  const [eventsSnap, photosSnap] = await Promise.all([
    getDocs(query(collection(db, 'events'), where('isPublic', '==', true))),
    // moderationStatus filter is required, not optional: firestore.rules
    // denies the whole query if any matched doc isn't approved, since rules
    // are evaluated per-document against the query result.
    getDocs(query(
      collection(db, 'galleryImages'),
      where('isPublic', '==', true),
      where('moderationStatus', '==', 'approved')
    )),
  ]);

  const photosByEvent = new Map<string, GalleryPhoto[]>();
  photosSnap.docs.forEach(d => {
    const photo = withId<GalleryPhoto>(d);
    if (!photo.eventId) return;
    const list = photosByEvent.get(photo.eventId) ?? [];
    list.push(photo);
    photosByEvent.set(photo.eventId, list);
  });

  return eventsSnap.docs
    .map(d => withId<EventItem>(d))
    .filter(isEffectivelyPublished)
    .map(event => ({ ...event, photos: photosByEvent.get(event.id) ?? [] }))
    .filter(event => event.photos.length > 0)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export interface Announcement extends Publishable {
  id: string;
  title: string;
  content: string;
  date?: string;
  /** Optional — once past, the announcement stops showing publicly even
   * though status stays 'published' (no need to remember to unpublish it). */
  expiresAt?: string;
}

function isNotExpired(a: { expiresAt?: string }): boolean {
  return !a.expiresAt || new Date(a.expiresAt).getTime() > Date.now();
}

export async function getAnnouncements(max = 3): Promise<Announcement[]> {
  const snap = await getDocs(
    query(collection(db, 'announcements'), orderBy('date', 'desc'), fbLimit(max))
  );
  return snap.docs.map(d => withId<Announcement>(d)).filter(isEffectivelyPublished).filter(isNotExpired);
}

export interface Ministry extends Publishable {
  id: string;
  title: string;
  description: string;
  category: string | string[];
  ageGroup?: string;
  meetingTime?: string;
  location?: string;
}

export async function getMinistries(): Promise<Ministry[]> {
  const snap = await getDocs(collection(db, 'ministries'));
  return snap.docs.map(d => withId<Ministry>(d)).filter(isEffectivelyPublished);
}

export interface TimelineEvent extends Publishable {
  id: string;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  featured?: boolean;
}

export async function getHistoryTimeline(): Promise<TimelineEvent[]> {
  const snap = await getDocs(query(collection(db, 'historyTimeline'), orderBy('year', 'asc')));
  return snap.docs.map(d => withId<TimelineEvent>(d)).filter(isEffectivelyPublished);
}

export interface StaffMember extends Publishable {
  id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  const snap = await getDocs(collection(db, 'staffMembers'));
  return snap.docs.map(d => withId<StaffMember>(d)).filter(isEffectivelyPublished);
}

export interface Livestream {
  title: string;
  description?: string;
  streamType?: string;
  streamUrl?: string;
  streamKey?: string;
  isLive: boolean;
  scheduledStart?: string;
  thumbnailUrl?: string;
  category?: string;
  viewerCount?: number;
  chatEnabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export async function getLivestream(): Promise<Livestream | null> {
  const snap = await getDoc(doc(db, 'livestream', 'current'));
  return snap.exists() ? (snap.data() as Livestream) : null;
}

export interface AmbientAudio {
  title: string;
  audioUrl: string;
  volume?: number;
  isActive: boolean;
}

export async function getAmbientAudio(): Promise<AmbientAudio | null> {
  const snap = await getDoc(doc(db, 'ambientAudio', 'current'));
  return snap.exists() ? (snap.data() as AmbientAudio) : null;
}

export interface SiteSettings {
  churchName?: string;
  tagline?: string;
  statistics?: {
    members?: string;
    yearsServing?: string;
    weeklyServices?: string;
    ministries?: string;
  };
  address?: string;
  phoneNumber?: string;
  email?: string;
  youtubeChannelUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
  whatsappGroupUrl?: string;
  zoomMeetingUrl?: string;
  officeHours?: string[];
  prayerStats?: { totalRequests?: number; totalPeople?: number; totalPrayers?: number };
  givingImpact?: {
    communityOutreach?: string;
    globalMissions?: string;
    educationMinistry?: string;
    youthPrograms?: string;
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, 'siteSettings', 'main'));
  return snap.exists() ? (snap.data() as SiteSettings) : null;
}

/**
 * Generic reader for the singleton "page config" documents that hold
 * editable marketing copy for a page (about, community, ministries,
 * services, branches). Callers already have `|| 'default text'` fallbacks
 * for every field, so returning `null` when the doc doesn't exist yet
 * (nobody has filled it in through the admin panel) is sufficient — pages
 * render their built-in defaults exactly like they did when Sanity had no
 * content for that page.
 */
export async function getPageContent<T = any>(pageKey: string): Promise<T | null> {
  const snap = await getDoc(doc(db, 'pageContent', pageKey));
  return snap.exists() ? (snap.data() as T) : null;
}

export interface SmallGroup extends Publishable {
  id: string;
  name: string;
  description?: string;
  leaderName?: string;
  meetingSchedule?: string;
  location?: string;
  capacity?: number;
  category?: string;
  imageUrl?: string;
}

export async function getSmallGroups(): Promise<SmallGroup[]> {
  const snap = await getDocs(collection(db, 'smallGroups'));
  return snap.docs.map(d => withId<SmallGroup>(d)).filter(isEffectivelyPublished);
}

export interface Testimonial {
  id: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  featured?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const snap = await getDocs(query(collection(db, 'testimonials'), where('moderationStatus', '==', 'approved')));
  return snap.docs.map(d => withId<Testimonial>(d));
}

export interface Resource extends Publishable {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
}

export async function getResources(): Promise<Resource[]> {
  const snap = await getDocs(collection(db, 'resources'));
  return snap.docs.map(d => withId<Resource>(d)).filter(isEffectivelyPublished);
}

export interface BlogPost extends Publishable {
  id: string; // == slug, since blog posts use their slug as the Firestore doc id
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  authorName?: string;
  category?: string;
  imageUrl?: string;
  date: string;
  featured?: boolean;
}

export async function getBlogPosts(max = 50): Promise<BlogPost[]> {
  const snap = await getDocs(query(collection(db, 'blogPosts'), orderBy('date', 'desc'), fbLimit(max)));
  return snap.docs.map(d => withId<BlogPost>(d)).filter(isEffectivelyPublished);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, 'blogPosts', slug));
  if (!snap.exists()) return null;
  const post = withId<BlogPost>(snap);
  return isEffectivelyPublished(post) ? post : null;
}

/**
 * Public reader for admin-defined custom content types (the schema
 * builder in /admin/content). All custom types share the single
 * `customContent` collection, partitioned by `contentType`, so a newly
 * created type is readable here immediately — no firestore.rules deploy
 * needed. See app/api/admin/content-types for how types are defined.
 */
export async function getCustomContent<T = Record<string, any>>(
  typeSlug: string
): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(collection(db, 'customContent'), where('contentType', '==', typeSlug)));
  return snap.docs.map(d => withId<T & { id: string }>(d)).filter(isEffectivelyPublished);
}
