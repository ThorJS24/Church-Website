'use client';

import { getIdToken } from '@/lib/firebase';

/**
 * fetch wrapper for admin-panel API calls: attaches the caller's Firebase
 * ID token automatically so every screen doesn't repeat that boilerplate.
 * Throws on non-2xx so callers can just `await adminFetch(...)` in a
 * try/catch and not worry about checking `.ok` themselves.
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getIdToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type') && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }

  return data;
}
