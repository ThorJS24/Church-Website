import { FieldSchema } from './contentType';

export interface FormDefinition {
  id: string; // slug, also the Firestore doc id
  title: string;
  description?: string;
  fields: FieldSchema[];
  /** Shown to the visitor after a successful submit. */
  successMessage?: string;
  /** If set, the visitor is redirected here instead of seeing the inline
   * success message — for forms that need a custom thank-you page. */
  thankYouUrl?: string;
  /** Staff email notified (via Resend) on every new submission. Optional —
   * without it, submissions are only visible by checking the admin panel. */
  notifyEmail?: string;
  createdBy?: string;
  createdByEmail?: string | null;
  createdAt?: string;
}

export const FORM_SLUG_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;
