import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

/** Public read of a form's structure (for the /forms/[id] render page).
 * Uses the Admin SDK rather than opening a direct client-Firestore read on
 * `formDefinitions`, so the collection's rules can stay admin-only in both
 * directions and this route fully controls what's exposed. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const doc = await getAdminDb().collection('formDefinitions').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }
    const { title, description, fields, thankYouUrl } = doc.data() as any;
    return NextResponse.json({ success: true, form: { id, title, description, fields, thankYouUrl } });
  } catch (error) {
    console.error(`Error fetching form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load form' }, { status: 500 });
  }
}
