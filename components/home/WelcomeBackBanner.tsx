'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui-legacy/Container';
import { LinkButton } from '@/components/ui-legacy/Button';

export default function WelcomeBackBanner() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.firstName || user.displayName?.split(' ')[0] || 'friend';

  return (
    <section className="border-b border-border bg-accent-subtle">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="flex items-center gap-2 text-body-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" /> Welcome back, {firstName}
        </p>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-body-sm font-medium text-accent hover:underline">My Dashboard</Link>
          <LinkButton href="/prayer" variant="ghost" size="sm">Prayer Wall</LinkButton>
        </div>
      </Container>
    </section>
  );
}
