import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User, Download } from 'lucide-react';
import { getSermonById, getSermons } from '@/lib/content';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { ShareButton } from '@/components/ShareButton';
import { PrintButton } from '@/components/PrintButton';
import { SaveButton } from '@/components/SaveButton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermonById(id);
  if (!sermon) return { title: 'Sermon not found — Salem Primitive Baptist Church' };

  const title = `${sermon.title} — Salem Primitive Baptist Church`;
  const description = sermon.description || sermon.subtitle || `A sermon from Salem Primitive Baptist Church${sermon.speakerName ? ` by ${sermon.speakerName}` : ''}.`;
  const thumbnail = sermon.imageUrl || (sermon.youtubeUrl ? `https://img.youtube.com/vi/${extractYouTubeId(sermon.youtubeUrl)}/maxresdefault.jpg` : undefined);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://salempbc.in/sermons/${sermon.id}`,
      images: thumbnail ? [{ url: thumbnail, width: 1200, height: 630, alt: sermon.title }] : undefined,
      type: 'video.other',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SermonDetailPage({ params }: Props) {
  const { id } = await params;
  const sermon = await getSermonById(id);
  if (!sermon) notFound();

  const embedUrl = sermon.youtubeUrl ? getYouTubeEmbedUrl(sermon.youtubeUrl) : null;
  const thumbnail = sermon.imageUrl || (sermon.youtubeUrl ? `https://img.youtube.com/vi/${extractYouTubeId(sermon.youtubeUrl)}/maxresdefault.jpg` : undefined);

  const allSermons = await getSermons(12);
  const relatedSermons = allSermons
    .filter((s) => s.id !== sermon.id)
    .sort((a, b) => (a.seriesTitle === sermon.seriesTitle ? -1 : 0) - (b.seriesTitle === sermon.seriesTitle ? -1 : 0))
    .slice(0, 3);

  const videoJsonLd = embedUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: sermon.title,
        description: sermon.description || sermon.subtitle || sermon.title,
        thumbnailUrl: thumbnail,
        uploadDate: sermon.date,
        contentUrl: sermon.youtubeUrl,
        embedUrl,
      }
    : null;

  return (
    <div>
      {videoJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}

      <Section spacing="lg">
        <Container size="md">
          <Breadcrumbs items={[{ label: 'Sermons', href: '/sermons' }, { label: sermon.title }]} className="mb-6 no-print" />

          {sermon.seriesTitle && <Badge variant="accent" className="mb-3">{sermon.seriesTitle}</Badge>}
          <h1 className="text-display-sm text-foreground">{sermon.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
            {sermon.speakerName && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {sermon.speakerName}</span>}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {new Date(sermon.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {sermon.scripture && <span className="font-medium text-warm">📖 {sermon.scripture}</span>}
          </p>

          {embedUrl && (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black no-print">
              <iframe
                src={embedUrl}
                title={sermon.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {sermon.description && <p className="mt-8 text-body-lg leading-relaxed text-foreground-muted">{sermon.description}</p>}

          <div className="mt-8 flex flex-wrap gap-3 no-print">
            <ShareButton title={sermon.title} />
            <SaveButton itemType="sermon" itemId={sermon.id} title={sermon.title} url={`/sermons/${sermon.id}`} />
            {sermon.audioUrl && (
              <LinkButton href={sermon.audioUrl} variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
                Download Audio
              </LinkButton>
            )}
          </div>

          {sermon.transcript && (
            <div className="mt-12 border-t border-border pt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-title-lg text-foreground">Transcript</h2>
                <div className="no-print">
                  <PrintButton label="Print Transcript" />
                </div>
              </div>
              <div className="whitespace-pre-line text-body-md leading-relaxed text-foreground-muted">
                {sermon.transcript}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {relatedSermons.length > 0 && (
        <Section spacing="lg" className="bg-surface no-print">
          <Container size="md">
            <h2 className="mb-6 text-title-lg text-foreground">Related Sermons</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedSermons.map((related) => (
                <a key={related.id} href={`/sermons/${related.id}`} className="block">
                  <Card padding="none" className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    <div className="relative aspect-video bg-zinc-900">
                      {related.imageUrl && <Image src={related.imageUrl} alt={related.title} fill sizes="300px" className="object-cover" />}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-body-sm font-medium text-foreground">{related.title}</p>
                      <p className="mt-1 text-caption text-foreground-subtle">{related.speakerName}</p>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
