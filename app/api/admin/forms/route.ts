import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { FORM_SLUG_PATTERN, FormDefinition } from '@/types/formSchema';
import { FieldSchema } from '@/types/contentType';

const VALID_FIELD_TYPES = new Set(['text', 'textarea', 'date', 'datetime', 'number', 'checkbox', 'url', 'email']);

function validateFields(fields: unknown): fields is FieldSchema[] {
  if (!Array.isArray(fields) || fields.length === 0) return false;
  return fields.every(
    (f) =>
      f && typeof f.key === 'string' && /^[a-zA-Z][a-zA-Z0-9]*$/.test(f.key) &&
      typeof f.label === 'string' && f.label.trim().length > 0 &&
      VALID_FIELD_TYPES.has(f.type)
  );
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const snap = await getAdminDb().collection('formDefinitions').get();
    const forms = snap.docs.map(d => ({ id: d.id, ...d.data() })) as FormDefinition[];
    return NextResponse.json({ success: true, forms });
  } catch (error) {
    console.error('Error listing forms:', error);
    return NextResponse.json({ success: false, message: 'Failed to list forms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const slug = String(body.id || '').trim().toLowerCase();
    const title = String(body.title || '').trim();
    const description = body.description ? String(body.description) : '';
    const successMessage = body.successMessage ? String(body.successMessage) : 'Thank you — your submission has been received.';
    const fields = body.fields;

    if (!FORM_SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ success: false, message: 'Slug must be lowercase letters, numbers, and hyphens, starting with a letter.' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required.' }, { status: 400 });
    }
    if (!validateFields(fields)) {
      return NextResponse.json({ success: false, message: 'At least one valid field is required.' }, { status: 400 });
    }

    const ref = getAdminDb().collection('formDefinitions').doc(slug);
    if ((await ref.get()).exists) {
      return NextResponse.json({ success: false, message: `A form with slug "${slug}" already exists.` }, { status: 409 });
    }

    const data: Omit<FormDefinition, 'id'> = {
      title,
      description,
      successMessage,
      fields,
      createdBy: authResult.user.uid,
      createdByEmail: authResult.user.email,
      createdAt: new Date().toISOString(),
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'form.create', targetType: 'formDefinitions', targetId: slug },
      async () => {
        await ref.set(data);
        return { after: data, result: null };
      }
    );

    return NextResponse.json({ success: true, id: slug });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ success: false, message: 'Failed to create form' }, { status: 500 });
  }
}
