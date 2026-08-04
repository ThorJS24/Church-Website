'use client';

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { getResources, Resource } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { LoadingState, EmptyState } from '@/components/ui/States';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources().then(setResources).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading resources..." />;

  const byCategory = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    const cat = r.category || 'General';
    (acc[cat] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <PageHero icon={<FileText />} eyebrow="Downloads" title="Resources" description="Bible studies, devotionals, and downloads" />

      <Section spacing="lg">
        <Container size="sm">
          {resources.length === 0 ? (
            <EmptyState icon={FileText} title="No resources available yet" />
          ) : (
            Object.entries(byCategory).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h2 className="mb-4 text-title-lg text-foreground">{category}</h2>
                <div className="space-y-3">
                  {items.map((r) => (
                    <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Card variant="interactive" className="flex items-center gap-4">
                        <FileText className="h-8 w-8 shrink-0 text-accent" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-md font-medium text-foreground">{r.title}</p>
                          {r.description && <p className="truncate text-body-sm text-foreground-muted">{r.description}</p>}
                        </div>
                        <Download className="h-5 w-5 shrink-0 text-foreground-subtle" />
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </Container>
      </Section>
    </div>
  );
}
