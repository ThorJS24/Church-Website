import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { User, CreateUserData } from '@/models/User';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export const createUser = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const signInUser = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

// User profile management
export const createUserProfile = async (firebaseUser: FirebaseUser, additionalData: Partial<CreateUserData> = {}) => {
  if (!firebaseUser) return null;
  
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || additionalData.displayName || '',
      firstName: additionalData.firstName || '',
      lastName: additionalData.lastName || '',
      photoURL: firebaseUser.photoURL || '',
      phone: additionalData.phone || '',
      address: additionalData.address || '',
      dateOfBirth: additionalData.dateOfBirth || '',
      interests: additionalData.interests || [],
      role: additionalData.role || 'visitor',
      membershipStatus: additionalData.membershipStatus || 'visitor',
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    try {
      await setDoc(userRef, userData);
      return userData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  return userDoc.data() as User;
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as User : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};