import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const newContact = {
      name,
      email,
      phone: phone || '',
      department: department || 'general',
      subject,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'contacts'), newContact);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: docRef.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}