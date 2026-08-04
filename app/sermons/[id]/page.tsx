import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSermonById } from '@/lib/content';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';

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

  const videoJsonLd = embedUrl ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: sermon.title,
    description: sermon.description || sermon.subtitle || sermon.title,
    thumbnailUrl: thumbnail,
    uploadDate: sermon.date,
    contentUrl: sermon.youtubeUrl,
    embedUrl,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {videoJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/sermons" className="text-sm text-blue-600 hover:underline">&larr; Back to Sermons</Link>

          {sermon.seriesTitle && (
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-6">{sermon.seriesTitle}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{sermon.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {sermon.speakerName ? `${sermon.speakerName} · ` : ''}{new Date(sermon.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            {sermon.scripture ? ` · ${sermon.scripture}` : ''}
          </p>

          {embedUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mb-8">
              <iframe
                src={embedUrl}
                title={sermon.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {sermon.description && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{sermon.description}</p>
          )}

          {sermon.audioUrl && (
            <a
              href={sermon.audioUrl}
              className="inline-block px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Audio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
