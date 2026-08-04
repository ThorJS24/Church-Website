import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';
import { FieldSchema } from '@/types/contentType';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`form-submit_${id}_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const formDoc = await getAdminDb().collection('formDefinitions').doc(id).get();
    if (!formDoc.exists) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }
    const fields = (formDoc.data()?.fields ?? []) as FieldSchema[];

    const body = await request.json();
    const data: Record<string, any> = {};
    for (const f of fields) {
      const raw = body[f.key];
      if (f.required && (raw === undefined || raw === '')) {
        return NextResponse.json({ success: false, message: `"${f.label}" is required.` }, { status: 400 });
      }
      if (raw === undefined) continue;
      // Only whitelisted field keys from the form's own definition are
      // stored — the request body can't smuggle arbitrary extra fields in.
      data[f.key] = f.type === 'number' ? Number(raw) : f.type === 'checkbox' ? !!raw : String(raw).slice(0, 5000);
    }

    await getAdminDb().collection('formSubmissions').add({
      formId: id,
      data,
      submittedAt: FieldValue.serverTimestamp(),
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error submitting form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to submit form' }, { status: 500 });
  }
}
