'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getUserProfile } from './firebase';
import { User } from '@/models/User';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'pastor' || user.role === 'staff';
  };

  const isAdmin = () => user?.role === 'admin';
  const isPastor = () => user?.role === 'pastor' || user?.role === 'admin';
  const isStaff = () => ['staff', 'pastor', 'admin'].includes(user?.role || '');

  return { 
    user, 
    firebaseUser, 
    loading, 
    hasPermission, 
    isAdmin, 
    isPastor, 
    isStaff 
  };
};