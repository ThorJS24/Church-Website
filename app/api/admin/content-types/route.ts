import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin, withAudit } from '@/lib/api-auth';
import { CONTENT_TYPE_SLUG_PATTERN, ContentTypeDefinition, FieldSchema } from '@/types/contentType';

// Slugs reserved by the built-in, hardcoded content collections — a custom
// type can't reuse one of these without shadowing real data.
const RESERVED_SLUGS = new Set([
  'sermons', 'events', 'pastors', 'series', 'speakers', 'ministries',
  'announcements', 'services', 'gallery', 'settings',
]);

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
    const snap = await getAdminDb().collection('contentTypes').get();
    const types = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ContentTypeDefinition[];
    return NextResponse.json({ success: true, types });
  } catch (error) {
    console.error('Error listing content types:', error);
    return NextResponse.json({ success: false, message: 'Failed to list content types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const slug = String(body.id || '').trim().toLowerCase();
    const label = String(body.label || '').trim();
    const pluralLabel = String(body.pluralLabel || '').trim();
    const fields = body.fields;
    const columns = Array.isArray(body.columns) ? body.columns.filter((c: unknown) => typeof c === 'string') : [];

    if (!CONTENT_TYPE_SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ success: false, message: 'Slug must be lowercase letters, numbers, and hyphens, starting with a letter.' }, { status: 400 });
    }
    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json({ success: false, message: `"${slug}" is reserved for a built-in content type.` }, { status: 400 });
    }
    if (!label || !pluralLabel) {
      return NextResponse.json({ success: false, message: 'Label and plural label are required.' }, { status: 400 });
    }
    if (!validateFields(fields)) {
      return NextResponse.json({ success: false, message: 'At least one valid field is required.' }, { status: 400 });
    }

    const ref = getAdminDb().collection('contentTypes').doc(slug);
    if ((await ref.get()).exists) {
      return NextResponse.json({ success: false, message: `A content type with slug "${slug}" already exists.` }, { status: 409 });
    }

    const validColumns = columns.filter((c: string) => fields.some((f: FieldSchema) => f.key === c));
    const data: Omit<ContentTypeDefinition, 'id'> = {
      label,
      pluralLabel,
      fields,
      columns: validColumns.length > 0 ? validColumns : [fields[0].key],
      createdBy: authResult.user.uid,
      createdByEmail: authResult.user.email,
      createdAt: new Date().toISOString(),
    };

    await withAudit(
      authResult.user,
      request,
      { action: 'content-type.create', targetType: 'contentTypes', targetId: slug },
      async () => {
        await ref.set(data);
        return { after: data, result: null };
      }
    );

    return NextResponse.json({ success: true, id: slug });
  } catch (error) {
    console.error('Error creating content type:', error);
    return NextResponse.json({ success: false, message: 'Failed to create content type' }, { status: 500 });
  }
}
