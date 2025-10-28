import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { searchContent } from '@/lib/algolia';
import { searchVerses } from '@/lib/bible-api';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    });
    
    return NextResponse.json({ success: true, userId: docRef.id });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const q = searchParams.get('q');
    
    // Handle search query
    if (q) {
      const [contentResults, bibleResults] = await Promise.all([
        searchContent(q),
        searchVerses(q)
      ]);
      
      return NextResponse.json({
        success: true,
        results: contentResults,
        bibleResults,
        totalResults: contentResults.length + bibleResults.length
      });
    }
    
    // Handle user lookup
    if (!email) {
      return NextResponse.json({ user: null });
    }
    
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    
    const user = querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}