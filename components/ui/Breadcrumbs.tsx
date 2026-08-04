import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-body-sm', className)}>
      <Link
        href="/"
        className="flex items-center text-foreground-subtle hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
            {item.href && !isLast ? (
              <Link href={item.href} className="text-foreground-muted hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined} className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
