export interface Sermon {
  id: string;
  title: string;
  description: string;
  speaker: string;
  series?: string;
  scripture?: string;
  date: string;
  duration?: string;
  videoUrl?: string;
  audioUrl?: string;
  notesUrl?: string;
  thumbnail?: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSermonData {
  title: string;
  description: string;
  speaker: string;
  series?: string;
  scripture?: string;
  date: string;
  duration?: string;
  videoUrl?: string;
  audioUrl?: string;
  notesUrl?: string;
  thumbnail?: string;
  tags?: string[];
  featured?: boolean;
}