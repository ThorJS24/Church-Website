import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className, required, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      // className also goes on the wrapper — see Input.tsx for why an
      // inner-only max-w-*/w-* is silently ignored by flex/grid layout.
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-label text-foreground">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={!!error || undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          required={required}
          className={cn(
            'w-full rounded-md border bg-background text-foreground placeholder:text-foreground-subtle',
            'px-3.5 py-2.5 text-body-md transition-colors duration-fast ease-standard',
            'focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-y',
            error ? 'border-danger' : 'border-border',
            className
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-1.5 text-caption text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-caption text-foreground-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
