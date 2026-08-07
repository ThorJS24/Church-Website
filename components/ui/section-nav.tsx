'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface SectionNavItem {
  id: string;
  label: string;
}

/**
 * Sticky in-page jump nav for long content pages — sits right below the
 * main fixed navbar (top-16) so it doesn't overlap it, highlights the
 * section currently in view via IntersectionObserver.
 */
export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-120px 0px -70% 0px' }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b border-border bg-background/95 px-4 backdrop-blur-md sm:mx-0 sm:px-0"
    >
      <div className="mx-auto flex max-w-3xl gap-1 py-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors',
              activeId === item.id ? 'bg-accent-subtle text-accent' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
