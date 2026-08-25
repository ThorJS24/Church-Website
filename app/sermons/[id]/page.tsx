import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { getSermonById, getSermons } from '@/lib/content';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { PrintButton } from '@/components/PrintButton';
import { SaveButton } from '@/components/SaveButton';
import { SermonVideoPlayer } from '@/components/SermonVideoPlayer';
import { SermonTranscript } from '@/components/SermonTranscript';

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

  const allSermons = await getSermons(50);
  const sameSeries = sermon.seriesTitle
    ? allSermons.filter((s) => s.seriesTitle === sermon.seriesTitle).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];
  const seriesIndex = sameSeries.findIndex((s) => s.id === sermon.id);
  const prevInSeries = seriesIndex > 0 ? sameSeries[seriesIndex - 1] : null;
  const nextInSeries = seriesIndex >= 0 && seriesIndex < sameSeries.length - 1 ? sameSeries[seriesIndex + 1] : null;

  const moreSermons = allSermons.filter((s) => s.id !== sermon.id && s.seriesTitle !== sermon.seriesTitle).slice(0, 4);

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

      {/* Theater: dark backdrop, video is the first thing seen — not
          preceded by a title block the way an events/generic page leads
          with text. This is a watch-first experience. */}
      <div className="bg-[#14110d] pb-2 pt-4 sm:pt-6">
        <Container size="lg">
          <Breadcrumbs
            items={[{ label: 'Sermons', href: '/sermons' }, { label: sermon.title }]}
            className="mb-4 no-print [&_*]:text-white/50 [&_a:hover]:text-white"
          />
          {embedUrl ? (
            <SermonVideoPlayer sermonId={sermon.id} embedUrl={embedUrl} title={sermon.title} />
          ) : thumbnail ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40">
              <Image src={thumbnail} alt={sermon.title} fill className="object-cover opacity-80" sizes="(max-width: 1024px) 100vw, 1024px" />
            </div>
          ) : null}
        </Container>
      </div>

      <Section spacing="lg" className="pt-8">
        <Container size="md">
          <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
            {/* Reading column */}
            <div>
              {sermon.seriesTitle && (
                <Badge variant="accent" className="mb-3">{sermon.seriesTitle}</Badge>
              )}
              <h1 className="font-serif text-display-sm text-foreground">{sermon.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
                {sermon.speakerName && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {sermon.speakerName}</span>}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {new Date(sermon.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </p>

              {sermon.scripture && (
                <blockquote className="mt-8 border-l-4 border-warm pl-5 font-serif text-title-lg italic text-warm">
                  {sermon.scripture}
                </blockquote>
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
                  <div className="font-serif text-body-lg leading-loose text-foreground">
                    <SermonTranscript transcript={sermon.transcript} />
                  </div>
                </div>
              )}
            </div>

            {/* Series rail — only the sermon page has this: a sequential
                reading order through a series, not a "related items" grid. */}
            {sameSeries.length > 1 && (
              <aside className="no-print">
                <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-foreground-subtle">{sermon.seriesTitle}</p>
                <div className="space-y-1">
                  {sameSeries.map((s) => (
                    <Link
                      key={s.id}
                      href={`/sermons/${s.id}`}
                      className={`block rounded-md px-3 py-2 text-body-sm ${s.id === sermon.id ? 'bg-accent-subtle font-medium text-accent' : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'}`}
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>

          {(prevInSeries || nextInSeries) && (
            <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6 no-print">
              {prevInSeries ? (
                <Link href={`/sermons/${prevInSeries.id}`} className="flex min-w-0 items-center gap-2 text-body-sm text-foreground-muted hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{prevInSeries.title}</span>
                </Link>
              ) : <span />}
              {nextInSeries && (
                <Link href={`/sermons/${nextInSeries.id}`} className="flex min-w-0 items-center gap-2 text-right text-body-sm font-medium text-accent hover:text-accent-hover">
                  <span className="truncate">{nextInSeries.title}</span> <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              )}
            </div>
          )}
        </Container>
      </Section>

      {moreSermons.length > 0 && (
        <Section spacing="lg" className="bg-surface no-print">
          <Container size="md">
            <h2 className="mb-6 text-title-lg text-foreground">More Sermons</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {moreSermons.map((s) => (
                <Link key={s.id} href={`/sermons/${s.id}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-active">
                    {s.imageUrl && <Image src={s.imageUrl} alt={s.title} fill sizes="260px" className="object-cover transition-transform duration-slow group-hover:scale-105" />}
                  </div>
                  <p className="mt-2 line-clamp-2 text-body-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-caption text-foreground-subtle">{s.speakerName}</p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
