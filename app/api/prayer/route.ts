import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, isPrivate, isAnonymous, authorName } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newPrayerRequest = {
      title,
      description,
      category: category || 'other',
      isPrivate: isPrivate || false,
      isAnonymous: isAnonymous || false,
      authorName: isAnonymous ? 'Anonymous' : (authorName || 'Anonymous'),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'prayerRequests'), newPrayerRequest);

    return NextResponse.json({
      success: true,
      message: 'Prayer request submitted successfully',
      id: docRef.id
    });

  } catch (error) {
    console.error('Prayer request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit prayer request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const prayerRequestsRef = collection(db, 'prayerRequests');
    const q = query(
      prayerRequestsRef,
      where('isPrivate', '==', false),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      prayerRequests: requests
    });

  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prayer requests' },
      { status: 500 }
    );
  }
}