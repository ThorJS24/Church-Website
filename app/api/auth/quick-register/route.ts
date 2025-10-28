import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, createUserProfile } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, {
      displayName: `${firstName} ${lastName || ''}`
    });

    const userProfile = await createUserProfile(firebaseUser, {
      firstName,
      lastName: lastName || '',
      role: 'member'
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userProfile
    });

  } catch (error: any) {
    console.error('Quick registration error:', error);
    
    let message = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already registered';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
    }
    
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}