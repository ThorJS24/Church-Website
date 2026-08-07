import { toast as sonnerToast } from 'sonner';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Thin adapter over sonner preserving the first rebuild's toast({ title,
 * description, variant }) call signature, so the many existing call sites
 * didn't need individual rewrites when migrating off the old hand-rolled
 * ToastProvider/useToast() — only the import path changed.
 */
export function toast({ title, description, variant = 'default', duration }: ToastOptions) {
  const options = { description, duration };
  switch (variant) {
    case 'success':
      return sonnerToast.success(title, options);
    case 'warning':
      return sonnerToast.warning(title, options);
    case 'danger':
      return sonnerToast.error(title, options);
    case 'info':
      return sonnerToast.info(title, options);
    default:
      return sonnerToast(title, options);
  }
}

/** Drop-in replacement for the old useToast() hook — sonner's toast() is a
 * global singleton, not React-context-based, so this needs no provider. */
export function useToast() {
  return { toast };
}
