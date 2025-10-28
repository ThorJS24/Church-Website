import { NextRequest, NextResponse } from 'next/server';
import { auth, db, updateUserProfile, getUserProfile } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, firstName, lastName, phone, address, dateOfBirth, interests } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 400 }
      );
    }

    const updateData = {
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      address: address || '',
      dateOfBirth: dateOfBirth || '',
      interests: interests || [],
      updatedAt: new Date().toISOString()
    };

    const success = await updateUserProfile(uid, updateData);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    const updatedUser = await getUserProfile(uid);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}