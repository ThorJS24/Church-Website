import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Play, BookOpen } from 'lucide-react';
import { getSeriesById, getSermons } from '@/lib/content';
import { extractYouTubeId } from '@/lib/utils';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/states';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeriesById(id);
  if (!series) return { title: 'Series not found — Salem Primitive Baptist Church' };

  const title = `${series.title} — Sermon Series — Salem Primitive Baptist Church`;
  const description = series.description || `Browse every sermon in the "${series.title}" series.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://salempbc.in/sermons/series/${series.id}`,
      images: series.imageUrl ? [{ url: series.imageUrl, width: 1200, height: 630, alt: series.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { id } = await params;
  const series = await getSeriesById(id);
  if (!series) notFound();

  // Sermons link to a series by title, not by id — there's no seriesId
  // foreign key in the sermon schema — so this filters client-side rather
  // than adding a `where('seriesTitle', '==', ...)` query, which would
  // need a new composite index (seriesTitle + date) that doesn't exist yet.
  const allSermons = await getSermons(200);
  const sermons = allSermons
    .filter((s) => s.seriesTitle === series.title)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <PageHero
        icon={<BookOpen />}
        eyebrow="Sermon Series"
        title={series.title}
        description={series.description || `${sermons.length} sermon${sermons.length === 1 ? '' : 's'} in this series`}
        breadcrumbs={[{ label: 'Sermons', href: '/sermons' }, { label: series.title }]}
      />

      <Section spacing="lg">
        <Container size="md">
          {sermons.length === 0 ? (
            <EmptyState as="h2" icon={BookOpen} title="No sermons in this series yet" description="Check back soon." />
          ) : (
            <>
              <div className="mb-10">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {sermons.map((sermon) => (
                    <div key={sermon.id} className="h-1.5 flex-1 rounded-full bg-accent/25" />
                  ))}
                </div>
                <p className="mt-2 text-center text-caption text-foreground-subtle">
                  {sermons.length} sermon{sermons.length === 1 ? '' : 's'} in this series
                </p>
              </div>

              <div className="space-y-4">
                {sermons.map((sermon, index) => (
                  <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block">
                    <Card variant="interactive" className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-body-sm font-semibold text-accent-hover">
                        {index + 1}
                      </div>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-active">
                        {sermon.imageUrl || sermon.youtubeUrl ? (
                          <Image
                            src={sermon.imageUrl || `https://img.youtube.com/vi/${extractYouTubeId(sermon.youtubeUrl || '')}/maxresdefault.jpg`}
                            alt={sermon.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Play className="h-5 w-5 text-foreground-subtle" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-caption font-medium text-accent">Part {index + 1} of {sermons.length}</p>
                        <h3 className="text-title-sm text-foreground">{sermon.title}</h3>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-body-sm text-foreground-muted">
                          {sermon.speakerName && (
                            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {sermon.speakerName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {new Date(sermon.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                        {sermon.scripture && <p className="mt-1 text-caption text-warm">📖 {sermon.scripture}</p>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
