import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { FieldSchema } from '@/types/contentType';

const VALID_FIELD_TYPES = new Set(['text', 'textarea', 'date', 'datetime', 'number', 'checkbox', 'url', 'email', 'file']);

function validateFields(fields: unknown): fields is FieldSchema[] {
  if (!Array.isArray(fields) || fields.length === 0) return false;
  return fields.every(
    (f) =>
      f && typeof f.key === 'string' && /^[a-zA-Z][a-zA-Z0-9]*$/.test(f.key) &&
      typeof f.label === 'string' && f.label.trim().length > 0 &&
      VALID_FIELD_TYPES.has(f.type)
  );
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const ref = getAdminDb().collection('formDefinitions').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const description = body.description ? String(body.description) : '';
    const successMessage = body.successMessage ? String(body.successMessage) : before.successMessage;
    const thankYouUrl = body.thankYouUrl !== undefined ? String(body.thankYouUrl) : (before.thankYouUrl ?? '');
    const notifyEmail = body.notifyEmail !== undefined ? String(body.notifyEmail) : (before.notifyEmail ?? '');
    const fields = body.fields;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required.' }, { status: 400 });
    }
    if (!validateFields(fields)) {
      return NextResponse.json({ success: false, message: 'At least one valid field is required.' }, { status: 400 });
    }

    const updates = { title, description, successMessage, thankYouUrl, notifyEmail, fields };

    await withAudit(
      authResult.user,
      request,
      { action: 'form.update', targetType: 'formDefinitions', targetId: id },
      async () => {
        await ref.update(updates);
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update form' }, { status: 500 });
  }
}

// Deletes the form definition. Existing submissions are left in place
// (not mass-deleted) — same reasoning as content-type deletion: a mistaken
// delete shouldn't silently destroy already-collected submissions.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { id } = await params;

  try {
    const ref = getAdminDb().collection('formDefinitions').doc(id);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'form.delete', targetType: 'formDefinitions', targetId: id },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting form ${id}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete form' }, { status: 500 });
  }
}
