export interface ContactFormData {
  formType: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  urgency?: 'normal' | 'urgent' | 'emergency';
  preferredContact?: 'email' | 'phone' | 'either';
  ministry?: string;
  availability?: string;
  skills?: string;
  eventType?: string;
  eventDate?: string;
  attendeeCount?: number;
  donationType?: string;
  amount?: number;
  organizationType?: string;
  organizationName?: string;
  mediaType?: string;
  status?: 'new' | 'progress' | 'resolved' | 'closed';
  assignedTo?: string;
  notes?: string;
  submittedAt?: string;
  ipAddress?: string;
}

export interface FormConfig {
  title: string;
  icon: any;
  description: string;
  color?: string;
}

export interface FormCategory {
  title: string;
  forms: Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
  }>;
}

export const FORM_TYPES = {
  GENERAL: 'general',
  PASTORAL: 'pastoral',
  PRAYER: 'prayer',
  BAPTISM: 'baptism',
  COUNSELING: 'counseling',
  VOLUNTEER: 'volunteer',
  DONATIONS: 'donations',
  FACILITY: 'facility',
  PARTNERSHIP: 'partnership',
  MEDIA: 'media',
  FEEDBACK: 'feedback',
  PRESS: 'press',
  MISSION: 'mission',
  TESTIMONY: 'testimony'
} as const;

export type FormType = typeof FORM_TYPES[keyof typeof FORM_TYPES];