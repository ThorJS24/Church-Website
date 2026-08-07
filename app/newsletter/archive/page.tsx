'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { LoadingState, EmptyState } from '@/components/ui/states';

interface CampaignSummary {
  id: string;
  subject: string;
  sentAt?: string;
}

export default function NewsletterArchivePage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null);

  useEffect(() => {
    fetch('/api/newsletter/archive')
      .then((res) => res.json())
      .then((data) => setCampaigns(data.success ? data.campaigns : []))
      .catch(() => setCampaigns([]));
  }, []);

  return (
    <Container size="sm" className="py-16">
      <h1 className="mb-2 font-serif text-headline-sm text-foreground">Newsletter Archive</h1>
      <p className="mb-8 text-body-sm text-foreground-muted">Past emails sent to our newsletter subscribers.</p>

      {campaigns === null ? (
        <LoadingState label="Loading archive..." />
      ) : campaigns.length === 0 ? (
        <EmptyState icon={Mail} title="No newsletters sent yet" />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/newsletter/archive/${c.id}`}>
              <Card variant="interactive" padding="md">
                <p className="text-title-sm text-foreground">{c.subject}</p>
                <p className="mt-1 text-caption text-foreground-subtle">
                  {c.sentAt ? new Date(c.sentAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
