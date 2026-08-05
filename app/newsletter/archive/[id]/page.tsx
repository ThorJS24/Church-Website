'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { LoadingState } from '@/components/ui-legacy/States';

interface CampaignDetail {
  id: string;
  subject: string;
  body: string;
  sentAt?: string;
}

export default function NewsletterArchiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignDetail | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/newsletter/archive/${id}`)
      .then((res) => res.json())
      .then((data) => setCampaign(data.success ? data.campaign : null))
      .catch(() => setCampaign(null));
  }, [id]);

  if (campaign === undefined) return <LoadingState label="Loading newsletter..." />;

  if (campaign === null) {
    return (
      <Container size="sm" className="flex min-h-[60vh] items-center justify-center py-16 text-center">
        <p className="text-body-md text-foreground-muted">This newsletter isn&apos;t available.</p>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-16">
      <Link href="/newsletter/archive" className="mb-6 inline-flex items-center gap-1 text-body-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to archive
      </Link>
      <Card variant="raised" padding="lg">
        <h1 className="text-headline-sm text-foreground">{campaign.subject}</h1>
        <p className="mt-1 text-caption text-foreground-subtle">
          {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
        </p>
        <div
          className="mt-6 space-y-4 text-body-md text-foreground [&_a]:text-accent [&_a]:underline [&_h2]:text-title-lg [&_h2]:text-foreground [&_hr]:border-border [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: campaign.body }}
        />
      </Card>
    </Container>
  );
}
