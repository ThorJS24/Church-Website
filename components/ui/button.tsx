'use client';

import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        // globals.css sets a global unlayered `* { border-color }` default
        // (see its comment) — unlayered CSS always beats layered utility
        // classes, so `border-transparent` can never win here. The only
        // reliable way to render no border at all is zeroing the WIDTH.
        primary: 'border-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground border-border hover:bg-muted',
        outline: 'border-border bg-background text-foreground hover:bg-muted hover:text-foreground',
        ghost: 'border-0 text-foreground hover:bg-muted hover:text-foreground',
        danger: 'border-0 bg-destructive text-white hover:bg-destructive/90 shadow-xs',
        warm: 'border-0 bg-warm text-warm-foreground hover:brightness-110 shadow-xs',
        link: 'border-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3 text-body-sm rounded-md',
        md: 'h-10 gap-2 px-4 text-body-md rounded-md',
        lg: 'h-12 gap-2.5 px-6 text-body-lg rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

/** Returns button classes for non-<button> elements that need to look
 * like one — e.g. a <label> wrapping a hidden file input, which can't
 * take a real `disabled` attribute, so the disabled look has to be
 * applied via classes instead. */
export function buttonClasses({
  variant,
  size,
  fullWidth,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(buttonVariants({ variant, size, fullWidth }), disabled && 'pointer-events-none opacity-50', className);
}

export interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading = false, disabled, leftIcon, rightIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export interface LinkButtonProps extends Omit<HTMLMotionProps<'a'>, 'ref' | 'children' | 'href'>, VariantProps<typeof buttonVariants> {
  href: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, variant, size, fullWidth, leftIcon, rightIcon, className, children, ...props }, ref) => {
    const isExternal = /^https?:\/\//.test(href) || props.target === '_blank';
    const Tag = isExternal ? motion.a : (motion.create(Link) as typeof motion.a);
    return (
      <Tag
        ref={ref}
        href={href}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </Tag>
    );
  }
);
LinkButton.displayName = 'LinkButton';

export { Button, LinkButton, buttonVariants };
