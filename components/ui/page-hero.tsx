'use client';

import { type ReactNode } from 'react';
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

export function PageHero({ eyebrow, title, description, icon, align = 'center', actions, className, breadcrumbs }: PageHeroProps) {
  return (
    <Section spacing="md" className={cn('border-b border-border bg-surface', className)}>
      {breadcrumbs && (
        <Breadcrumbs
          items={breadcrumbs}
          className={cn('mb-6', align === 'center' && 'justify-center')}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={cn('mx-auto max-w-3xl', align === 'center' ? 'text-center' : 'text-left')}
      >
        {icon && (
          <div className={cn('mb-5 flex', align === 'center' ? 'justify-center' : 'justify-start')}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent [&_svg]:h-7 [&_svg]:w-7">
              {icon}
            </div>
          </div>
        )}
        {eyebrow && (
          <p className="mb-3 text-label uppercase tracking-wide text-accent">{eyebrow}</p>
        )}
        <h1 className="font-serif text-display-sm text-foreground">{title}</h1>
        {description && (
          <p className="mt-4 text-body-lg text-foreground-muted">{description}</p>
        )}
        {actions && <div className={cn('mt-7 flex gap-3', align === 'center' ? 'justify-center' : 'justify-start')}>{actions}</div>}
      </motion.div>
    </Section>
  );
}
