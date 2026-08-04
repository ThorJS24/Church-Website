import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={cn(
              'peer h-5 w-5 shrink-0 appearance-none rounded border border-border bg-background',
              'checked:bg-accent checked:border-accent',
              'transition-colors duration-fast ease-standard cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent/40',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-accent-foreground opacity-0 peer-checked:opacity-100" />
        </div>
        {(label || description) && (
          <label htmlFor={inputId} className="cursor-pointer select-none">
            {label && <span className="block text-body-sm text-foreground">{label}</span>}
            {description && (
              <span className="block text-caption text-foreground-subtle">{description}</span>
            )}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
