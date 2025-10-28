import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, orderBy, query, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const contactsRef = collection(db, 'enhanced_contacts');
    const q = query(contactsRef, orderBy('submittedAt', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      submissions
    });

  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes, assignedTo } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const docRef = doc(db, 'enhanced_contacts', id);
    await updateDoc(docRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully'
    });

  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update submission' },
      { status: 500 }
    );
  }
}