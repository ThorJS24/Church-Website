// Firebase Event Interface
export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  category: 'worship' | 'ministry' | 'outreach' | 'social' | 'education' | 'youth' | 'children';
  featured: boolean;
  image?: string;
  maxAttendees?: number;
  registeredAttendees: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  category: Event['category'];
  featured?: boolean;
  image?: string;
  maxAttendees?: number;
  createdBy: string;
}