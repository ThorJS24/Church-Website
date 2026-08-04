'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warm';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active shadow-xs',
  secondary:
    'bg-surface text-foreground border border-border hover:bg-surface-hover active:bg-surface-active',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-surface-hover active:bg-surface-active',
  ghost: 'bg-transparent text-foreground hover:bg-surface-hover active:bg-surface-active',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95 shadow-xs',
  warm: 'bg-warm text-warm-foreground hover:brightness-110 active:brightness-95 shadow-xs',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-body-md gap-2 rounded-md',
  lg: 'h-12 px-6 text-body-lg gap-2.5 rounded-lg',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center font-medium min-h-touch',
    'transition-colors duration-fast ease-standard',
    disabled ? 'opacity-50 pointer-events-none' : '',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className
  );
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.12 }}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, fullWidth, disabled: disabled || loading, className })}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export interface LinkButtonProps extends Omit<HTMLMotionProps<'a'>, 'ref' | 'children' | 'href'> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const MotionLink = motion.create(Link);

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth = false, className, children, ...props }, ref) => {
    return (
      <MotionLink
        ref={ref}
        href={href}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </MotionLink>
    );
  }
);
LinkButton.displayName = 'LinkButton';
