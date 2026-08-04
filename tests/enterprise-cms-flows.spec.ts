import { test, expect } from '@playwright/test';
import { UserRole } from '../lib/permissions';
import {
  createTestUser,
  deleteTestUser,
  deleteFirestoreDoc,
  deleteFirestoreDocsWhere,
  queryFirestoreDocs,
  getFirestoreDocById,
} from './helpers/testAuth';

// Real create/edit/delete round-trips for the two most architecturally
// novel pieces added this session (custom content types share a single
// Firestore collection by design; the forms builder validates against a
// schema it doesn't know about until request time) — auth-guard tests
// elsewhere confirm who can reach these routes, this confirms they
// actually do the right thing once reached.

test.describe('Custom content type (schema builder) round-trip', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  const slug = `it-test-type-${Date.now()}`;
  let docId: string;

  test.beforeAll(async () => {
    admin = await createTestUser(UserRole.ADMIN);
  });

  test.afterAll(async () => {
    const cleanup: Promise<unknown>[] = [deleteTestUser(admin.uid), deleteFirestoreDoc('contentTypes', slug)];
    if (docId) {
      cleanup.push(deleteFirestoreDoc('customContent', docId));
      cleanup.push(deleteFirestoreDocsWhere('contentVersions', 'docId', docId));
    }
    await Promise.allSettled(cleanup);
  });

  test('define a type, create/edit/restore/delete a document, delete the type without cascading', async ({ request }) => {
    const headers = { Authorization: `Bearer ${admin.idToken}` };

    // 1. Define the type
    const createType = await request.post('/api/admin/content-types', {
      headers,
      data: {
        id: slug,
        label: 'IT Test Item',
        pluralLabel: 'IT Test Items',
        fields: [{ key: 'title', label: 'Title', type: 'text', required: true }],
        columns: ['title'],
      },
    });
    expect(createType.status()).toBe(200);

    // 2. Create a document of that type
    const createDoc = await request.post(`/api/admin/custom-content/${slug}`, {
      headers,
      data: { title: 'Original Title' },
    });
    expect(createDoc.status()).toBe(200);
    const createBody = await createDoc.json();
    docId = createBody.id;
    expect(docId).toBeTruthy();

    const afterCreate = await getFirestoreDocById('customContent', docId);
    expect(afterCreate?.contentType).toBe(slug);
    expect(afterCreate?.title).toBe('Original Title');

    // 3. Edit it — should snapshot the pre-edit state to contentVersions
    const update = await request.put(`/api/admin/custom-content/${slug}/${docId}`, {
      headers,
      data: { title: 'Edited Title' },
    });
    expect(update.status()).toBe(200);

    const afterEdit = await getFirestoreDocById('customContent', docId);
    expect(afterEdit?.title).toBe('Edited Title');
    // contentType is server-set and must survive an update even though the
    // client didn't send it — this is what stops a doc from silently
    // jumping partitions via an unrelated field edit.
    expect(afterEdit?.contentType).toBe(slug);

    const versions = await queryFirestoreDocs('contentVersions', 'docId', docId);
    expect(versions.length).toBe(1);
    expect((versions[0] as any).snapshot.title).toBe('Original Title');
    expect((versions[0] as any).editedByEmail).toBe(admin.email);

    // 4. Restore the version — content should revert, and restoring itself
    // creates a second version so the restore isn't a dead end
    const versionsResp = await request.get(`/api/admin/custom-content/${slug}/${docId}/versions`, { headers });
    const { versions: fetchedVersions } = await versionsResp.json();
    const restore = await request.post(
      `/api/admin/custom-content/${slug}/${docId}/versions/${fetchedVersions[0].id}/restore`,
      { headers }
    );
    expect(restore.status()).toBe(200);

    const afterRestore = await getFirestoreDocById('customContent', docId);
    expect(afterRestore?.title).toBe('Original Title');

    const versionsAfterRestore = await queryFirestoreDocs('contentVersions', 'docId', docId);
    expect(versionsAfterRestore.length).toBe(2);

    // 5. Deleting the type definition must NOT delete the document it describes
    const deleteType = await request.delete(`/api/admin/content-types/${slug}`, { headers });
    expect(deleteType.status()).toBe(200);

    const docAfterTypeDelete = await getFirestoreDocById('customContent', docId);
    expect(docAfterTypeDelete).not.toBeNull();
    expect(docAfterTypeDelete?.title).toBe('Original Title');
  });

  test('writing to a type that was never defined is rejected', async ({ request }) => {
    const resp = await request.post('/api/admin/custom-content/never-defined-type', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: { title: 'x' },
    });
    expect(resp.status()).toBe(404);
  });
});

test.describe('Forms builder round-trip', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  let moderator: Awaited<ReturnType<typeof createTestUser>>;
  const formId = `it-test-form-${Date.now()}`;

  test.beforeAll(async () => {
    [admin, moderator] = await Promise.all([
      createTestUser(UserRole.ADMIN),
      createTestUser(UserRole.MODERATOR),
    ]);
  });

  test.afterAll(async () => {
    await Promise.allSettled([
      deleteTestUser(admin.uid),
      deleteTestUser(moderator.uid),
      deleteFirestoreDoc('formDefinitions', formId),
      deleteFirestoreDocsWhere('formSubmissions', 'formId', formId),
    ]);
  });

  test('create a form, submit it publicly, validate required fields, view as moderator, delete without cascading', async ({ request }) => {
    // 1. Admin defines the form
    const createForm = await request.post('/api/admin/forms', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: {
        id: formId,
        title: 'IT Test Form',
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'note', label: 'Note', type: 'textarea', required: false },
        ],
      },
    });
    expect(createForm.status()).toBe(200);

    // 2. The public definition route exposes structure, not internal metadata
    const publicForm = await request.get(`/api/forms/${formId}`);
    expect(publicForm.status()).toBe(200);
    const { form } = await publicForm.json();
    expect(form.title).toBe('IT Test Form');
    expect(form.fields).toHaveLength(2);
    expect(form.createdBy).toBeUndefined();

    // 3. Submitting without the required field is rejected
    const missingRequired = await request.post(`/api/forms/${formId}/submit`, {
      data: { note: 'no name given' },
    });
    expect(missingRequired.status()).toBe(400);

    // 4. A real public (unauthenticated) submission succeeds
    const submit = await request.post(`/api/forms/${formId}/submit`, {
      data: { name: 'Integration Test Submitter', note: 'hello' },
    });
    expect(submit.status()).toBe(200);

    // 5. Only moderator+ can read submissions back, and the data round-trips
    const submissions = await request.get(`/api/admin/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer ${moderator.idToken}` },
    });
    expect(submissions.status()).toBe(200);
    const { submissions: fetchedSubmissions } = await submissions.json();
    expect(fetchedSubmissions).toHaveLength(1);
    expect(fetchedSubmissions[0].data.name).toBe('Integration Test Submitter');

    // 6. Deleting the form must NOT delete already-collected submissions
    const deleteForm = await request.delete(`/api/admin/forms/${formId}`, {
      headers: { Authorization: `Bearer ${admin.idToken}` },
    });
    expect(deleteForm.status()).toBe(200);

    const submissionStillExists = await getFirestoreDocById('formSubmissions', fetchedSubmissions[0].id);
    expect(submissionStillExists).not.toBeNull();

    // 7. The public route for a deleted form now 404s
    const afterDelete = await request.get(`/api/forms/${formId}`);
    expect(afterDelete.status()).toBe(404);
  });

  test('submitting to a form that does not exist is rejected, not silently stored', async ({ request }) => {
    const submit = await request.post('/api/forms/nonexistent-form-xyz/submit', {
      data: { name: 'x' },
    });
    expect(submit.status()).toBe(404);
  });
});

test.describe('Form submissions only store whitelisted fields', () => {
  let admin: Awaited<ReturnType<typeof createTestUser>>;
  const formId = `it-test-smuggle-${Date.now()}`;

  test.beforeAll(async () => {
    admin = await createTestUser(UserRole.ADMIN);
  });

  test.afterAll(async () => {
    await Promise.allSettled([
      deleteTestUser(admin.uid),
      deleteFirestoreDoc('formDefinitions', formId),
      deleteFirestoreDocsWhere('formSubmissions', 'formId', formId),
    ]);
  });

  test('a request body cannot smuggle fields the form does not define', async ({ request }) => {
    await request.post('/api/admin/forms', {
      headers: { Authorization: `Bearer ${admin.idToken}` },
      data: { id: formId, title: 'Smuggle Test', fields: [{ key: 'name', label: 'Name', type: 'text', required: true }] },
    });

    const submit = await request.post(`/api/forms/${formId}/submit`, {
      data: { name: 'Real Field', role: 'admin', isAdmin: true, extraJunk: 'should not persist' },
    });
    expect(submit.status()).toBe(200);

    const stored = await queryFirestoreDocs('formSubmissions', 'formId', formId);
    expect(stored).toHaveLength(1);
    expect((stored[0] as any).data).toEqual({ name: 'Real Field' });
  });
});
