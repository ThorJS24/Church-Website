import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;

  try {
    const ref = getAdminDb().collection('contentTypes').doc(slug);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Content type not found' }, { status: 404 });
    }

    const body = await request.json();
    const label = String(body.label || '').trim();
    const pluralLabel = String(body.pluralLabel || '').trim();
    const fields = body.fields;
    const columns = Array.isArray(body.columns) ? body.columns.filter((c: unknown) => typeof c === 'string') : [];

    if (!label || !pluralLabel) {
      return NextResponse.json({ success: false, message: 'Label and plural label are required.' }, { status: 400 });
    }
    if (!validateFields(fields)) {
      return NextResponse.json({ success: false, message: 'At least one valid field is required.' }, { status: 400 });
    }

    const validColumns = columns.filter((c: string) => fields.some((f: FieldSchema) => f.key === c));
    const updates = {
      label,
      pluralLabel,
      fields,
      columns: validColumns.length > 0 ? validColumns : [fields[0].key],
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'content-type.update', targetType: 'contentTypes', targetId: slug },
      async () => {
        await ref.update(updates);
        return { before, after: updates, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating content type ${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update content type' }, { status: 500 });
  }
}

// Deletes the type definition only — existing customContent docs of this
// type are left in place (not mass-deleted) so removing a type by mistake
// can't silently destroy real content. They just stop appearing in the
// admin panel until the type is redefined with the same slug.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  const { slug } = await params;

  try {
    const ref = getAdminDb().collection('contentTypes').doc(slug);
    const before = (await ref.get()).data();
    if (!before) {
      return NextResponse.json({ success: false, message: 'Content type not found' }, { status: 404 });
    }

    await withAudit(
      authResult.user,
      request,
      { action: 'content-type.delete', targetType: 'contentTypes', targetId: slug },
      async () => {
        await ref.delete();
        return { before, after: null, result: null };
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting content type ${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete content type' }, { status: 500 });
  }
}
