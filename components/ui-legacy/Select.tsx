import { forwardRef, type SelectHTMLAttributes, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 text-body-sm pl-3 pr-8',
  md: 'h-10 text-body-md pl-3.5 pr-9',
  lg: 'h-12 text-body-lg pl-4 pr-9',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, options, placeholder, size = 'md', id, className, required, ...props },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      // className also goes on the wrapper — see Input.tsx for why an
      // inner-only max-w-*/w-* is silently ignored by flex/grid layout.
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-label text-foreground">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error || undefined}
            aria-describedby={cn(hintId, errorId) || undefined}
            required={required}
            className={cn(
              'w-full appearance-none rounded-md border bg-background text-foreground',
              'transition-colors duration-fast ease-standard',
              'focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-danger' : 'border-border',
              SIZE_CLASSES[size],
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
            aria-hidden="true"
          />
        </div>
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
Select.displayName = 'Select';
