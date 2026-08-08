import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode, ComponentType } from 'react';
import { Button } from './button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-accent" aria-hidden="true" />
        <p className="text-body-sm text-foreground-muted">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  as: Heading = 'h3',
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Heading level for `title` — defaults to h3 (the common case: nested
   * under a section's own h2). Pass "h2" when this is the first heading
   * after the page's h1 (e.g. no other section heading precedes it), so
   * the document's heading order doesn't skip a level. */
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="px-4 py-16 text-center">
      <Icon className="mx-auto mb-3 h-12 w-12 text-foreground-subtle" aria-hidden="true" />
      <Heading className="mb-1 text-title-sm text-foreground">{title}</Heading>
      {description && <p className="mb-4 text-body-sm text-foreground-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="px-4 py-16 text-center">
      <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-danger" aria-hidden="true" />
      <h3 className="mb-1 text-title-sm text-foreground">Something went wrong</h3>
      <p className="mb-4 text-body-sm text-foreground-muted">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}
