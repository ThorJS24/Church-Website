'use client';

import { createContext, useCallback, useContext, useState, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMounted } from '@/hooks/useMounted';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

const ICON_CLASSES: Record<ToastVariant, string> = {
  default: 'text-foreground-muted',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useMounted();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...options, id }]);
      const duration = options.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
            <AnimatePresence>
              {toasts.map((t) => {
                const Icon = ICONS[t.variant ?? 'default'];
                return (
                  <motion.div
                    key={t.id}
                    role="status"
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 32 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-lg"
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', ICON_CLASSES[t.variant ?? 'default'])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-foreground">{t.title}</p>
                      {t.description && (
                        <p className="mt-0.5 text-caption text-foreground-muted">{t.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss notification"
                      onClick={() => dismiss(t.id)}
                      className="shrink-0 text-foreground-subtle hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
