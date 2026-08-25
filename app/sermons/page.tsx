import { BookOpen } from 'lucide-react';
import { getSermons, getSeriesList, getSpeakersList } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { SermonsBrowser } from '@/components/sermons/SermonsBrowser';

export const revalidate = 300;

export default async function SermonsPage() {
  const [sermons, series, speakers] = await Promise.all([
    getSermons(20),
    getSeriesList(),
    getSpeakersList(),
  ]);

  return (
    <div>
      <PageHero
        icon={<BookOpen />}
        eyebrow="Sermon Library"
        title="Sermons"
        description="A searchable archive of every message — filter by series, speaker, or scripture."
      />
      <SermonsBrowser initialSermons={sermons} initialSeries={series} initialSpeakers={speakers} />
    </div>
  );
}
