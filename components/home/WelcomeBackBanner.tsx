'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';

interface NextEvent {
  id: string;
  title: string;
  startDate: string;
}

export default function WelcomeBackBanner() {
  const { user } = useAuth();
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/member/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.nextEvent) setNextEvent(data.nextEvent);
    })();
  }, [user]);

  if (!user) return null;

  const firstName = user.firstName || user.displayName?.split(' ')[0] || 'friend';

  return (
    <section className="border-b border-border bg-accent-subtle">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="flex items-center gap-2 text-body-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" /> Welcome back, {firstName}
          {nextEvent && (
            <span className="hidden items-center gap-1.5 border-l border-accent/30 pl-3 font-normal text-accent/90 sm:flex">
              <Calendar className="h-3.5 w-3.5" />
              Next up: <Link href={`/events/${nextEvent.id}`} className="underline underline-offset-2 hover:text-accent">{nextEvent.title}</Link>
              {' '}on {new Date(nextEvent.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-body-sm font-medium text-accent hover:underline dark:text-accent-hover">My Dashboard</Link>
          <LinkButton href="/prayer" variant="ghost" size="sm">Prayer Wall</LinkButton>
        </div>
      </Container>
    </section>
  );
}
