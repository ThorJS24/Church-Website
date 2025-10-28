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
  role: 'visitor' | 'member' | 'volunteer' | 'staff' | 'pastor' | 'admin';
  membershipStatus: 'member' | 'visitor' | 'regular_attendee';
  joinDate: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
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