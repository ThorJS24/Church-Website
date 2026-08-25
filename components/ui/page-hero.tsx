'use client';

import { type ReactNode, cloneElement, isValidElement } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { Section } from './section';
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';

export interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  align?: 'center' | 'left';
  actions?: ReactNode;
  className?: string;
  breadcrumbs?: BreadcrumbItem[];
}

// A single shared header shell used across ~25 list/info pages — reskinned
// once here rather than per-page. Grid-disciplined, not decorative: a
// mono-set eyebrow above a hairline rule, a left-aligned display headline,
// and an icon (when passed) rendered small and structural in its own
// bordered cell rather than a large low-opacity watermark bleeding behind
// the text. `align="center"` is kept for the few pages that want it, but
// left is now the honest default — centering is a choice, not the shape
// this shell forces on every page.
export function PageHero({ eyebrow, title, description, icon, align = 'left', actions, className, breadcrumbs }: PageHeroProps) {
  const iconEl = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })
    : icon;

  return (
    <Section spacing="sm" className={cn('border-b border-border bg-background', className)}>
      {breadcrumbs && (
        <Breadcrumbs
          items={breadcrumbs}
          className={cn('mb-6', align === 'center' && 'justify-center')}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(align === 'center' && 'mx-auto max-w-3xl text-center')}
      >
        {eyebrow && (
          <div className={cn('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
            {iconEl && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border-strong text-accent">
                {iconEl}
              </span>
            )}
            <span className="font-mono text-caption font-semibold uppercase tracking-[0.1em] text-accent">
              {eyebrow}
            </span>
            <span className={cn('h-px flex-1 bg-border', align === 'center' && 'hidden')} aria-hidden="true" />
          </div>
        )}

        <h1 className={cn('font-display text-display-sm text-foreground', align !== 'center' && 'max-w-3xl')}>{title}</h1>

        {description && (
          <p className={cn('mt-4 max-w-2xl text-body-lg text-foreground-muted', align === 'center' && 'mx-auto')}>{description}</p>
        )}
        {actions && <div className={cn('mt-7 flex flex-wrap gap-3', align === 'center' ? 'justify-center' : 'justify-start')}>{actions}</div>}
      </motion.div>
    </Section>
  );
}
