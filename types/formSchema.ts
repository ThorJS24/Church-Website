import { FieldSchema } from './contentType';

export interface FormDefinition {
  id: string; // slug, also the Firestore doc id
  title: string;
  description?: string;
  fields: FieldSchema[];
  /** Shown to the visitor after a successful submit. */
  successMessage?: string;
  createdBy?: string;
  createdByEmail?: string | null;
  createdAt?: string;
}

export const FORM_SLUG_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;
