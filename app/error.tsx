'use client';

import { AlertTriangle } from 'lucide-react';
import { LinkButton, Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-subtle text-danger">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-display-md text-foreground">500</h1>
        <h2 className="mt-2 text-title-lg text-foreground">Something went wrong</h2>
        <p className="mt-3 text-body-md text-foreground-muted">We&apos;re sorry, but something went wrong on our end.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <LinkButton href="/" variant="outline">Go Home</LinkButton>
        </div>
      </div>
    </div>
  );
}
