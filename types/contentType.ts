// Shared between server (content-type/custom-content API routes) and
// client (admin panel forms) — no runtime dependencies, safe to import
// from either.

export type FieldType = 'text' | 'textarea' | 'date' | 'datetime' | 'number' | 'checkbox' | 'url' | 'email';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** For `type: 'url'` fields that hold an image — shows a "Browse Media" picker button. */
  accept?: 'image';
}

/** An admin-defined custom content type (the schema builder). Stored in
 * Firestore's `contentTypes` collection, doc id === `id` (the slug). Its
 * documents live in the shared `customContent` collection. */
export interface ContentTypeDefinition {
  id: string;
  label: string;
  pluralLabel: string;
  fields: FieldSchema[];
  columns: string[];
  createdBy?: string;
  createdByEmail?: string | null;
  createdAt?: string;
}

/** slug rule: lowercase letters/numbers/hyphens, must start with a letter — keeps it a safe Firestore doc id and URL segment. */
export const CONTENT_TYPE_SLUG_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;
