import { Resend } from 'resend';

// Lazy, same reasoning as lib/firebase-admin.ts's getAdminDb(): Next.js
// imports every route module during `next build` to collect its metadata,
// so a top-level `new Resend(process.env.RESEND_API_KEY)` throws
// "Missing API key" and fails the production build itself on any
// environment where RESEND_API_KEY isn't set — including the build step,
// which never actually sends an email.
let _resend: Resend | undefined;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
