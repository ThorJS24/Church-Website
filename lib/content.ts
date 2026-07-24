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

export interface Sermon {
  id: string;
  title: string;
  subtitle?: string;
  speakerName?: string;
  seriesTitle?: string;
  date: string;
  youtubeUrl?: string;
  imageUrl?: string;
  duration?: number;
  scripture?: string;
  description?: string;
  featured?: boolean;
}

export async function getSermons(max = 20): Promise<Sermon[]> {
  const snap = await getDocs(query(collection(db, 'sermons'), orderBy('date', 'desc'), fbLimit(max)));
  return snap.docs.map(d => withId<Sermon>(d));
}

export async function getSeriesList(): Promise<{ id: string; title: string }[]> {
  const snap = await getDocs(collection(db, 'series'));
  return snap.docs.map(d => withId(d));
}

export async function getSpeakersList(): Promise<{ id: string; name: string }[]> {
  const snap = await getDocs(collection(db, 'speakers'));
  return snap.docs.map(d => withId(d));
}

export interface Pastor {
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
  return snap.docs.map(d => withId<Pastor>(d));
}

export interface EventItem {
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
  return snap.docs.map(d => withId<EventItem>(d));
}

export interface ServiceTime {
  id: string;
  title: string;
  time: string;
  location: string;
  description?: string;
}

export async function getServiceTimes(): Promise<ServiceTime[]> {
  const snap = await getDocs(collection(db, 'services'));
  return snap.docs.map(d => withId<ServiceTime>(d));
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
    .map(event => ({ ...event, photos: photosByEvent.get(event.id) ?? [] }))
    .filter(event => event.photos.length > 0)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date?: string;
}

export async function getAnnouncements(max = 3): Promise<Announcement[]> {
  const snap = await getDocs(
    query(collection(db, 'announcements'), orderBy('date', 'desc'), fbLimit(max))
  );
  return snap.docs.map(d => withId<Announcement>(d));
}

export interface Ministry {
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
  return snap.docs.map(d => withId<Ministry>(d));
}

export interface TimelineEvent {
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
  return snap.docs.map(d => withId<TimelineEvent>(d));
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  const snap = await getDocs(collection(db, 'staffMembers'));
  return snap.docs.map(d => withId<StaffMember>(d));
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
