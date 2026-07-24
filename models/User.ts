// Firebase User Type Definition
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  interests?: string[];
  role: 'member' | 'moderator' | 'admin' | 'super_admin';
  membershipStatus: 'member' | 'visitor' | 'regular_attendee';
  joinDate: string;
  createdAt: string;
  updatedAt?: string;
  // isActive === false is how "suspend" is represented — it's already what
  // lib/api-auth.ts checks to reject a disabled account's requests, so
  // suspension reuses that instead of introducing a second status field.
  isActive: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  notificationPreferences?: {
    email?: boolean;
    events?: boolean;
    prayers?: boolean;
  };
  privacyPreferences?: {
    profileVisible?: boolean;
    contactVisible?: boolean;
  };
}

export interface CreateUserData {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  interests?: string[];
  role?: User['role'];
  membershipStatus?: User['membershipStatus'];
}