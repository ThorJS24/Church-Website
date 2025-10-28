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