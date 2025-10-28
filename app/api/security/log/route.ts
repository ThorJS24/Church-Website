import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const securityEvent = await request.json();
    
    // Log to Firebase Firestore instead of MongoDB
    await addDoc(collection(db, 'security_logs'), {
      ...securityEvent,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Security log error:', error);
    // Fail silently for security logs to not break the app
    return NextResponse.json({ success: true });
  }
}