'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import {
  auth,
  signInUser,
  createUser,
  logOut,
  createUserProfile,
  getUserProfile,
  updateUserProfile as updateFirestoreProfile,
  changeUserPassword,
} from '@/lib/firebase';
import { User } from '@/models/User';
import { UserRole, Permission, hasPermission as checkPermission, roleAtLeast } from '@/lib/permissions';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  membershipStatus?: User['membershipStatus'];
  referralSource?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterInput) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  canAccessAdminPanel: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInUser(email, password);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async ({ name, email, password, membershipStatus, referralSource }: RegisterInput): Promise<boolean> => {
    try {
      const credential = await createUser(email, password);
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ');

      await updateFirebaseProfile(credential.user, { displayName: name });
      const profile = await createUserProfile(credential.user, {
        firstName,
        lastName,
        role: 'member',
        membershipStatus,
        referralSource,
      });
      setUser(profile);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const success = await updateFirestoreProfile(user.uid, updates);
    if (success) {
      setUser({ ...user, ...updates });
    }
    return success;
  };

  const changePassword = (currentPassword: string, newPassword: string) =>
    changeUserPassword(currentPassword, newPassword);

  const hasPermission = (permission: Permission) =>
    !!user && checkPermission(user.role as UserRole, permission);

  const isSuperAdmin = () => roleAtLeast(user?.role as UserRole, UserRole.SUPER_ADMIN);
  const isAdmin = () => roleAtLeast(user?.role as UserRole, UserRole.ADMIN);
  const isModerator = () => roleAtLeast(user?.role as UserRole, UserRole.MODERATOR);
  const canAccessAdminPanel = () => isModerator();

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, login, logout, register, updateUser, changePassword, hasPermission,
        isSuperAdmin, isAdmin, isModerator, canAccessAdminPanel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
