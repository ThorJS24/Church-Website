// Domain entity types introduced by the backend/domain-model redesign (see
// the approved "Domain Architecture Redesign" doc). Additive only: existing
// collections keep every field they had before; interfaces here describe
// what's new, or list only the fields an existing entity gained.
//
// Convention throughout: store the ID, resolve display data server-side
// (see lib/repositories/*). No field here is a delimiter-joined string of
// names — every "who"/"what does this belong to" relationship is a real
// Firestore document reference (a string ID pointing at another collection).

export type EntityStatus = 'active' | 'inactive';
export type PublishStatus = 'draft' | 'published';

/**
 * The canonical identity for anyone the platform names — a speaker, a
 * ministry leader, a staff pastor, a member, a volunteer. Doc id === the
 * linked Firebase Auth uid when this person has a login; a generated id
 * otherwise. A pastor with no account and a member with a login are the
 * same entity type, differing only in whether `userId` is set.
 */
export interface Person {
  id: string;
  displayName: string;
  photoUrl?: string | null;
  bio?: string;
  email?: string | null;
  phone?: string | null;
  /** Display-only congregational title, e.g. "Senior Pastor" — not a privilege level. */
  title?: string;
  isStaff?: boolean;
  /** -> users/{uid}. Null for a named person with no login (most speakers/leaders today). */
  userId?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  geo?: { lat: number; lng: number } | null;
  accessibilityInfo?: string;
  notes?: string;
}

/** New fields added to the existing `ministries` collection (see lib/content.ts `Ministry`). */
export interface MinistryRelations {
  leaderIds?: string[]; // -> people
}

/** New fields added to the existing `smallGroups` collection (see lib/content.ts `SmallGroup`). */
export interface GroupRelations {
  ministryId?: string | null; // -> ministries
  leaderIds?: string[]; // -> people
  locationId?: string | null; // -> locations
}

/** New fields added to the existing `events` collection (see lib/content.ts `EventItem`). */
export interface EventRelations {
  organizerId?: string | null; // -> people
  ministryId?: string | null; // -> ministries
  groupId?: string | null; // -> smallGroups
  locationId?: string | null; // -> locations
  mediaAssetIds?: string[]; // -> mediaAssets
}

export type MembershipRole = 'leader' | 'member';
export type MembershipStatus = 'active' | 'inactive';

export interface MinistryMembership {
  id: string; // `${personId}_${ministryId}`
  personId: string;
  ministryId: string;
  roleInMinistry: MembershipRole;
  joinedAt: string;
  status: MembershipStatus;
}

export interface GroupMembership {
  id: string; // `${personId}_${groupId}`
  personId: string;
  groupId: string;
  roleInGroup: MembershipRole;
  joinedAt: string;
  status: MembershipStatus;
}

export type VolunteerOpportunityStatus = 'open' | 'filled' | 'closed';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  ministryId?: string | null; // -> ministries
  eventId?: string | null; // -> events
  area?: string;
  spotsNeeded?: number;
  spotsFilled: number;
  shiftDate?: string;
  shiftTime?: string;
  locationId?: string | null; // -> locations
  location?: string; // legacy free-text fallback
  status: VolunteerOpportunityStatus;
}

export type VolunteerAssignmentStatus = 'applied' | 'confirmed' | 'completed' | 'cancelled';

export interface VolunteerAssignment {
  id: string;
  opportunityId: string; // -> volunteerOpportunities
  personId: string; // -> people
  status: VolunteerAssignmentStatus;
  hoursLogged?: number;
  notes?: string;
  createdAt: string;
}

export type AttendanceMethod = 'self' | 'staff';

/**
 * Distinct from EventRegistration (RSVP intent): a check-in record proving
 * someone actually showed up. Nothing in the pre-redesign schema captured
 * this — registrations only ever recorded intent to attend.
 */
export interface EventAttendance {
  id: string;
  eventId: string; // -> events
  personId?: string | null; // -> people, null for a walk-in with no account
  guestName?: string | null;
  checkedInAt: string;
  checkedInBy: string; // -> people (the staff/admin who recorded it, or the attendee's own personId for self check-in)
  method: AttendanceMethod;
}

export type MediaAssetType = 'video' | 'audio' | 'image' | 'document';
export type MediaSourceProvider = 'cloudinary' | 'youtube' | 'external';

/**
 * Supersedes the unreferenced `mediaLibrary` index: this is the actual
 * target of `mediaAssetId` reference fields on sermons/events/gallery/
 * resources/blog posts, not just a browse-and-copy-a-URL picker.
 */
export interface MediaAsset {
  id: string;
  type: MediaAssetType;
  sourceProvider: MediaSourceProvider;
  url: string;
  cloudinaryPublicId?: string | null;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  altText?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string | null; // -> people
  contentHash?: string | null;
  tags?: string[];
  createdAt: string;
}

export interface ScriptureReference {
  book: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
}

/** New/changed fields on the existing `sermons` collection. `speakerName`/`seriesTitle` stay present as legacy fallbacks during migration. */
export interface SermonRelations {
  speakerId?: string | null; // -> people
  seriesId?: string | null; // -> series
  scriptureRefs?: ScriptureReference[];
  topics?: string[];
  mediaAssetId?: string | null; // -> mediaAssets
  relatedSermonIds?: string[];
}

/** New field on the existing `series` collection — maintained on sermon write, not stored as an array of ids (avoids write fan-out). */
export interface SeriesRelations {
  sermonCount?: number;
}

/** New field on the existing `galleryImages` collection — replaces the free-text `photographer` field. */
export interface GalleryItemRelations {
  photographerId?: string | null; // -> people
  mediaAssetId?: string | null; // -> mediaAssets
}

export interface GivingFund {
  id: string;
  name: string;
  description?: string;
  goalAmount?: number;
  raisedAmount: number;
  isActive: boolean;
}

export type GivingRecordStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Application-level reference only — see the architecture doc's Giving
 * section. No card number, bank account, or payment-provider secret is
 * ever modeled here. This collection exists as schema scaffolding for a
 * not-yet-chosen payment provider; nothing writes to it today.
 */
export interface GivingRecord {
  id: string;
  fundId: string; // -> givingFunds
  donorPersonId?: string | null; // -> people, null = anonymous
  amount: number;
  currency: string;
  status: GivingRecordStatus;
  externalProvider?: string;
  externalTransactionId?: string;
  createdAt: string;
}
