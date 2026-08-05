import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Public status lookup for a requester's own submission — gated by their
// own email rather than requiring an account, since service requests
// don't need one. Returns only what's needed to show progress, never the
// full record (no phone, no internal notes).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }

  try {
    const doc = await getAdminDb().collection('serviceRequests').doc(id).get();
    if (!doc.exists || String(doc.data()?.email || '').toLowerCase() !== email) {
      return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
    }

    const data = doc.data()!;
    return NextResponse.json({
      success: true,
      request: {
        serviceType: data.serviceType,
        status: data.status || 'pending',
        preferredDate: data.preferredDate,
        submittedAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  } catch (error) {
    console.error(`Error fetching service request ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load request' }, { status: 500 });
  }
}
