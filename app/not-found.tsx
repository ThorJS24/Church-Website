'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Compass } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/not-found-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname || window.location.pathname }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-display-md text-foreground">404</h1>
        <h2 className="mt-2 text-title-lg text-foreground">Page Not Found</h2>
        <p className="mt-3 text-body-md text-foreground-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <LinkButton href="/" className="mt-8">Go Home</LinkButton>
      </div>
    </div>
  );
}
