import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CardVariant = 'flat' | 'raised' | 'outline' | 'interactive';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  flat: 'bg-surface border border-border',
  raised: 'bg-background border border-border shadow-md',
  outline: 'bg-transparent border border-border',
  interactive:
    'bg-surface border border-border shadow-xs hover:shadow-md hover:border-border-strong transition-all duration-base ease-standard cursor-pointer',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'flat', padding = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl', VARIANT_CLASSES[variant], PADDING_CLASSES[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-title-lg text-foreground', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-body-sm text-foreground-muted mt-1', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex items-center gap-3', className)} {...props} />
);
