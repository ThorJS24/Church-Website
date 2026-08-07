import * as React from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'flat' | 'raised' | 'outline' | 'interactive';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  flat: 'bg-surface border border-border',
  raised: 'bg-background border border-border shadow-md',
  outline: 'bg-transparent border border-border',
  interactive:
    'bg-surface border border-border shadow-xs hover:shadow-md hover:border-border-strong transition-all duration-base ease-standard cursor-pointer',
};

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'flat', padding = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn('rounded-xl', VARIANT_CLASSES[variant], PADDING_CLASSES[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-header" className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 data-slot="card-title" className={cn('text-title-lg text-foreground', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="card-description" className={cn('mt-1 text-body-sm text-foreground-muted', className)} {...props} />;
}

function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-action" className={cn('ml-auto self-start', className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={className} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-footer" className={cn('mt-4 flex items-center gap-3', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
