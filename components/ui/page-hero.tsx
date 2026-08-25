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
// once here rather than per-page. Structurally different from a plain
// centered icon-chip/title/description stack: a warm gradient band with the
// icon rendered as a large low-opacity watermark behind the text (not a
// small foreground badge), the eyebrow as a bordered pill, and the title
// flanked by decorative rules when centered.
export function PageHero({ eyebrow, title, description, icon, align = 'center', actions, className, breadcrumbs }: PageHeroProps) {
  const watermark = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-full w-full' })
    : icon;

  return (
    <Section spacing="md" className={cn('relative overflow-hidden border-b border-border bg-gradient-to-br from-surface via-background to-accent-subtle/50', className)}>
      {watermark && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 h-40 w-40 -translate-y-1/2 text-accent/10 sm:h-56 sm:w-56',
            align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-4 sm:right-10'
          )}
        >
          {watermark}
        </div>
      )}

      {breadcrumbs && (
        <Breadcrumbs
          items={breadcrumbs}
          className={cn('relative mb-6', align === 'center' && 'justify-center')}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn('relative mx-auto max-w-3xl', align === 'center' ? 'text-center' : 'text-left')}
      >
        {eyebrow && (
          <span className={cn('mb-4 inline-flex items-center rounded-full border border-accent/30 bg-background/60 px-3 py-1 text-label uppercase tracking-wide text-accent backdrop-blur-sm')}>
            {eyebrow}
          </span>
        )}

        {align === 'center' ? (
          <div className="flex items-center justify-center gap-4">
            <span className="hidden h-px flex-1 max-w-16 bg-border sm:block" aria-hidden="true" />
            <h1 className="font-serif text-display-sm text-foreground">{title}</h1>
            <span className="hidden h-px flex-1 max-w-16 bg-border sm:block" aria-hidden="true" />
          </div>
        ) : (
          <h1 className="font-serif text-display-sm text-foreground">{title}</h1>
        )}

        {description && (
          <p className="mt-4 text-body-lg text-foreground-muted">{description}</p>
        )}
        {actions && <div className={cn('mt-7 flex flex-wrap gap-3', align === 'center' ? 'justify-center' : 'justify-start')}>{actions}</div>}
      </motion.div>
    </Section>
  );
}
