import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';
import { getResend } from '@/lib/resend';
import cloudinary from '@/lib/cloudinary';
import { FieldSchema } from '@/types/contentType';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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
    const formData = formDoc.data() as { fields?: FieldSchema[]; notifyEmail?: string; title?: string };
    const fields = formData.fields ?? [];

    // File fields arrive as multipart; everything else arrives as JSON.
    // Branching on content-type rather than always requiring multipart
    // keeps every existing file-less form submitting exactly as before.
    const isMultipart = (request.headers.get('content-type') || '').includes('multipart/form-data');
    const raw: Record<string, any> = {};
    if (isMultipart) {
      const form = await request.formData();
      for (const f of fields) {
        if (f.type === 'file') {
          const file = form.get(f.key) as File | null;
          if (file && file.size > 0) {
            const bytes = Buffer.from(await file.arrayBuffer());
            const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
            const asset = await cloudinary.uploader.upload(dataUri, { folder: 'form-submissions', resource_type: 'auto' });
            raw[f.key] = asset.secure_url;
          }
        } else {
          raw[f.key] = form.get(f.key);
        }
      }
    } else {
      Object.assign(raw, await request.json());
    }

    const data: Record<string, any> = {};
    let emailFieldValue: string | null = null;
    for (const f of fields) {
      const value = raw[f.key];
      if (f.required && (value === undefined || value === null || value === '')) {
        return NextResponse.json({ success: false, message: `"${f.label}" is required.` }, { status: 400 });
      }
      if (value === undefined || value === null) continue;
      if (f.type === 'file') {
        data[f.key] = String(value);
      } else {
        data[f.key] = f.type === 'number' ? Number(value) : f.type === 'checkbox' ? (value === true || value === 'true') : String(value).slice(0, 5000);
        if (f.type === 'email' && !emailFieldValue) emailFieldValue = String(value).toLowerCase().trim();
      }
    }

    // Duplicate-submission prevention: same form + same identifying signal
    // (the form's own email field if it has one, else the submitter's IP)
    // resubmitted within the window is rejected — catches double-clicks
    // and accidental re-submits without blocking genuinely repeat visitors
    // days apart.
    const dedupeKey = emailFieldValue || ip;
    const recentSnap = await getAdminDb()
      .collection('formSubmissions')
      .where('formId', '==', id)
      .where('dedupeKey', '==', dedupeKey)
      .get();
    const now = Date.now();
    const hasRecent = recentSnap.docs.some((d) => {
      const submittedAt = d.data().submittedAt;
      const ts = submittedAt?.toMillis ? submittedAt.toMillis() : new Date(submittedAt).getTime();
      return now - ts < DUPLICATE_WINDOW_MS;
    });
    if (hasRecent) {
      return NextResponse.json(
        { success: false, message: "You've already submitted this form recently. Thank you!" },
        { status: 409 }
      );
    }

    await getAdminDb().collection('formSubmissions').add({
      formId: id,
      data,
      dedupeKey,
      submittedAt: FieldValue.serverTimestamp(),
      ip,
    });

    if (formData.notifyEmail) {
      const summary = fields.map((f) => `${f.label}: ${data[f.key] ?? '—'}`).join('\n');
      getResend().emails.send({
        from: FROM_EMAIL,
        to: formData.notifyEmail,
        subject: `New submission: ${formData.title || id}`,
        text: summary,
      }).catch((err) => console.error(`Form notification email failed for ${id}:`, err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error submitting form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to submit form' }, { status: 500 });
  }
}
