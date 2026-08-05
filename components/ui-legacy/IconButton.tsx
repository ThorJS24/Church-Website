'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { ButtonVariant, ButtonSize } from './Button';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active',
  secondary: 'bg-surface text-foreground border border-border hover:bg-surface-hover',
  outline: 'bg-transparent text-foreground border border-border hover:bg-surface-hover',
  ghost: 'bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground',
  danger: 'bg-danger text-white hover:brightness-110',
  warm: 'bg-warm text-warm-foreground hover:brightness-110',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 rounded-md [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 w-10 rounded-md [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 w-12 rounded-lg [&_svg]:h-5 [&_svg]:w-5',
};

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, disabled, className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={{ scale: disabled ? 1 : 0.94 }}
        transition={{ duration: 0.12 }}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center shrink-0 min-h-touch min-w-touch',
          'transition-colors duration-fast ease-standard',
          'disabled:opacity-50 disabled:pointer-events-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
IconButton.displayName = 'IconButton';
