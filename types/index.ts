export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'visitor' | 'member' | 'volunteer' | 'staff' | 'pastor' | 'admin';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  isRecurring: boolean;
  maxAttendees?: number;
  registeredAttendees: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prayer {
  _id: string;
  title: string;
  description: string;
  isPublic: boolean;
  isAnswered: boolean;
  requestedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ministry {
  _id: string;
  name: string;
  description: string;
  category: string;
  ageGroup: string;
  meetingTime: string;
  location: string;
  leader: string;
  volunteers: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sermon {
  _id: string;
  title: string;
  speaker: string;
  date: Date;
  duration: string;
  series: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  notesUrl?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  department: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}