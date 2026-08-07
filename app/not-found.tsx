'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Compass, Search, BookOpen, Calendar, Heart } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import CommandPalette from '@/components/CommandPalette';

const POPULAR_ROUTES = [
  { href: '/sermons', label: 'Sermons', icon: BookOpen },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/give', label: 'Give', icon: Heart },
];

export default function NotFound() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

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

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/">Go Home</LinkButton>
          <Button variant="secondary" leftIcon={<Search className="h-4 w-4" />} onClick={() => setShowSearch(true)}>
            Search the site
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <span className="text-caption text-foreground-subtle">Or try:</span>
          {POPULAR_ROUTES.map((route) => (
            <LinkButton key={route.href} href={route.href} variant="ghost" size="sm" leftIcon={<route.icon className="h-3.5 w-3.5" />}>
              {route.label}
            </LinkButton>
          ))}
        </div>
      </div>

      <CommandPalette isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}
