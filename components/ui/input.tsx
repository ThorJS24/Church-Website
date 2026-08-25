import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 text-body-sm',
  md: 'h-10 text-body-md',
  lg: 'h-12 text-body-lg',
};

// Left/right padding are applied separately (rather than via a single
// `px-*` class) so that an icon's `pl-9`/`pr-9` never has to coexist with
// a conflicting `px-*` on the same element — cn()/tailwind-merge can't
// resolve that conflict reliably since Tailwind's compiled stylesheet
// order, not className order, decides which wins.
const SIZE_PL = {
  sm: 'pl-3',
  md: 'pl-3.5',
  lg: 'pl-4',
};

const SIZE_PR = {
  sm: 'pr-3',
  md: 'pr-3.5',
  lg: 'pr-4',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightIcon, size = 'md', id, className, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    // Shake only on the transition into an error state, not on every
    // re-render while the error message is present (which would shake
    // continuously as the user keeps typing against a still-invalid value).
    const [shake, setShake] = useState(false);
    const hadError = useRef(!!error);
    useEffect(() => {
      if (error && !hadError.current) {
        setShake(true);
        const t = setTimeout(() => setShake(false), 400);
        hadError.current = true;
        return () => clearTimeout(t);
      }
      hadError.current = !!error;
    }, [error]);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-label text-foreground">
            {label}
            {required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}
        <div className={cn('relative', shake && 'animate-shake')}>
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle [&_svg]:h-4 [&_svg]:w-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={cn(hintId, errorId) || undefined}
            required={required}
            className={cn(
              'w-full rounded-md border bg-background text-foreground placeholder:text-foreground-subtle',
              'transition-colors duration-fast ease-standard',
              'focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-danger' : 'border-border',
              SIZE_CLASSES[size],
              leftIcon ? 'pl-10' : SIZE_PL[size],
              rightIcon ? 'pr-10' : SIZE_PR[size],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle [&_svg]:h-4 [&_svg]:w-4">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 text-caption text-danger">{error}</p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-caption text-foreground-subtle">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
