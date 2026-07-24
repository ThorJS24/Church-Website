export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: 'healing' | 'guidance' | 'thanksgiving' | 'family' | 'work' | 'general';
  isPrivate: boolean;
  isAnonymous: boolean;
  requestedBy?: string;
  authorName: string;
  prayedBy: Array<{
    user: string;
    prayedAt: string;
  }>;
  status: 'active' | 'answered' | 'archived';
  // Moderation gate, independent of the lifecycle `status` above — a prayer
  // request can be 'active' but still awaiting moderator approval before
  // it's publicly visible.
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrayerRequestData {
  title: string;
  description: string;
  category?: PrayerRequest['category'];
  isPrivate?: boolean;
  isAnonymous?: boolean;
  requestedBy?: string;
  authorName?: string;
}