'use client';

import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, User, Clock, Search, BookOpen, Video, Radio, History, Bookmark, BookmarkCheck, SlidersHorizontal } from 'lucide-react';
import { getLivestream, Sermon, Series } from '@/lib/content';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EmptyState } from '@/components/ui/states';
import { LoadingState } from '@/components/ui/states';
import { cn } from '@/lib/utils';

const DynamicLiveStream = lazy(() => import('@/components/DynamicLiveStream'));

const RECENT_KEY = 'salempbc:recentlyWatchedSermons';
const QUEUE_KEY = 'salempbc:sermonQueue';

type Speaker = { id: string; name: string; bio?: string; imageUrl?: string };

function getQueue(): string[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleQueue(id: string): string[] {
  const current = getQueue();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

// A sermon's `scripture` field is freeform ("John 3:16-21", "1 Corinthians
// 13"), so "book" isn't a stored field — it's derived by stripping the
// trailing chapter:verse numbers off the reference.
function scriptureBook(reference: string): string {
  return reference.replace(/\s+\d.*$/, '').trim();
}

function recordWatched(sermon: Sermon) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: Array<{ id: string; title: string; watchedAt: number }> = raw ? JSON.parse(raw) : [];
    const next = [{ id: sermon.id, title: sermon.title, watchedAt: Date.now() }, ...list.filter((s) => s.id !== sermon.id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable — continue-watching is a nice-to-have, not critical
  }
}

function getRecentlyWatched(): Array<{ id: string; title: string; watchedAt: number }> {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface SermonsBrowserProps {
  initialSermons: Sermon[];
  initialSeries: Series[];
  initialSpeakers: Speaker[];
}

export function SermonsBrowser({ initialSermons, initialSeries, initialSpeakers }: SermonsBrowserProps) {
  const [sermons] = useState<Sermon[]>(initialSermons);
  const [series] = useState<Series[]>(initialSeries);
  const [speakers] = useState<Speaker[]>(initialSpeakers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All Speakers');
  const [selectedVideo, setSelectedVideo] = useState<Sermon | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState<Array<{ id: string; title: string; watchedAt: number }>>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [queueOnly, setQueueOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Livestream status is polled client-side so it stays fresh between
    // ISR revalidations of the sermons list itself.
    getLivestream()
      .then((livestreamData) => { if (livestreamData) setHasLiveStream(livestreamData.isLive); })
      .catch((error) => console.error('Error fetching livestream:', error));
    setRecentlyWatched(getRecentlyWatched());
    setQueue(getQueue());
  }, []);

  const featuredSermon = sermons[0] || null;

  const scriptureBooks = useMemo(
    () => Array.from(new Set(sermons.filter((s) => s.scripture).map((s) => scriptureBook(s.scripture!)))).sort(),
    [sermons]
  );

  // Sermons only carry a seriesTitle string, not a seriesId — this maps
  // back to the series doc's id so its title can link to /sermons/series/[id].
  const seriesIdByTitle = useMemo(() => new Map(series.map((s) => [s.title, s.id])), [series]);

  const selectedSpeakerBio = selectedSpeaker !== 'All Speakers' ? speakers.find((s) => s.name === selectedSpeaker) : null;

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeries = selectedSeries === 'All Series' || sermon.seriesTitle === selectedSeries;
    const matchesSpeaker = selectedSpeaker === 'All Speakers' || sermon.speakerName === selectedSpeaker;
    const matchesBook = !selectedBook || (sermon.scripture && scriptureBook(sermon.scripture) === selectedBook);
    const matchesQueue = !queueOnly || queue.includes(sermon.id);
    return matchesSearch && matchesSeries && matchesSpeaker && matchesBook && matchesQueue;
  });

  const onToggleQueue = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setQueue(toggleQueue(id));
  };

  const groupedSermons = useMemo(() => {
    const groups: Record<string, { monthName: string; sermons: Sermon[] }> = {};
    filteredSermons.forEach((sermon) => {
      const date = new Date(sermon.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = { monthName, sermons: [] };
      groups[key].sermons.push(sermon);
    });
    return groups;
  }, [filteredSermons]);

  const watchSermon = (sermon: Sermon) => {
    setSelectedVideo(sermon);
    recordWatched(sermon);
    setRecentlyWatched(getRecentlyWatched());
  };

  const activeFilterCount = [selectedSeries !== 'All Series', selectedSpeaker !== 'All Speakers', queueOnly].filter(Boolean).length;

  const renderFilterControls = (mobile = false) => (
    <>
      <Select
        aria-label="Filter by series"
        value={selectedSeries}
        onChange={(e) => setSelectedSeries(e.target.value)}
        options={[{ value: 'All Series', label: 'All Series' }, ...series.map((s) => ({ value: s.title, label: s.title }))]}
        className={mobile ? 'w-full' : 'w-auto'}
      />
      <Select
        aria-label="Filter by speaker"
        value={selectedSpeaker}
        onChange={(e) => setSelectedSpeaker(e.target.value)}
        options={[{ value: 'All Speakers', label: 'All Speakers' }, ...speakers.map((s) => ({ value: s.name, label: s.name }))]}
        className={mobile ? 'w-full' : 'w-auto'}
      />
      <div className={cn('flex border border-border', mobile && 'w-full')}>
        {(['grid', 'timeline'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'px-3 py-1.5 text-body-sm capitalize transition-colors',
              mobile && 'flex-1',
              viewMode === mode ? 'bg-accent text-accent-foreground' : 'text-foreground-muted hover:bg-surface-hover'
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      <button
        onClick={() => setQueueOnly((v) => !v)}
        className={cn(
          'flex items-center justify-center gap-1.5 border border-border px-3 py-1.5 text-body-sm transition-colors',
          mobile && 'w-full',
          queueOnly ? 'bg-accent text-accent-foreground border-accent' : 'text-foreground-muted hover:bg-surface-hover'
        )}
      >
        {queueOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        My Queue {queue.length > 0 && `(${queue.length})`}
      </button>
    </>
  );

  return (
    <div>
      <Section spacing="sm" className="bg-surface">
        <div className="flex justify-center">
          {hasLiveStream ? (
            <Button variant="danger" leftIcon={<Radio className="h-4 w-4 animate-pulse" />} onClick={() => setShowLiveStream(true)}>
              Watch Live Stream
            </Button>
          ) : (
            <Badge variant="neutral"><Radio className="h-4 w-4" /> No Live Stream Currently</Badge>
          )}
        </div>
      </Section>

      {recentlyWatched.length > 0 && (
        <Section spacing="sm" className="bg-surface">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-foreground-subtle" />
            <h2 className="text-title-sm text-foreground">Continue Watching</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyWatched.map((r) => {
              const sermon = sermons.find((s) => s.id === r.id);
              if (!sermon) return null;
              return (
                <button
                  key={r.id}
                  onClick={() => watchSermon(sermon)}
                  className="shrink-0 border border-border bg-background px-4 py-2.5 text-left text-body-sm text-foreground transition-colors hover:border-accent"
                >
                  {sermon.title}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {featuredSermon && (
        // Same dark theater treatment as the sermon detail page's video
        // opener, so "latest sermon" reads as a preview of that watching
        // experience rather than a generic marketing feature card.
        <Section spacing="lg" className="bg-[#14161A]">
          <p className="mb-8 text-center font-mono text-caption font-semibold uppercase tracking-[0.14em] text-white/50">Latest Sermon</p>
          <div className="mx-auto max-w-4xl overflow-hidden border border-white/10">
            <div className="md:flex">
              <div className="relative h-64 shrink-0 bg-black/40 md:h-auto md:w-1/2">
                {featuredSermon.imageUrl ? (
                  <Image src={featuredSermon.imageUrl} alt={featuredSermon.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-90" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  {featuredSermon.youtubeUrl && extractYouTubeId(featuredSermon.youtubeUrl) && (
                    <button
                      onClick={() => watchSermon(featuredSermon)}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-accent shadow-lg transition-transform hover:scale-105"
                    >
                      <Play className="ml-1 h-9 w-9 text-accent-foreground" />
                    </button>
                  )}
                </div>
                {featuredSermon.duration && (
                  <Badge variant="neutral" className="absolute bottom-3 right-3 bg-background/90">{featuredSermon.duration} minutes</Badge>
                )}
              </div>
              <div className="flex-1 bg-[#1c1712] p-8 text-white">
                <div className="mb-2 flex items-center justify-between">
                  {featuredSermon.seriesTitle && seriesIdByTitle.has(featuredSermon.seriesTitle) ? (
                    <Link href={`/sermons/series/${seriesIdByTitle.get(featuredSermon.seriesTitle)}`} className="text-body-sm font-semibold text-accent hover:underline">
                      {featuredSermon.seriesTitle}
                    </Link>
                  ) : (
                    <span className="text-body-sm font-semibold text-accent">{featuredSermon.seriesTitle}</span>
                  )}
                  <Badge variant="warning">Latest</Badge>
                </div>
                <h3 className="font-display text-headline-sm">{featuredSermon.title}</h3>
                {featuredSermon.subtitle && <p className="mt-1 text-body-sm text-white/60">{featuredSermon.subtitle}</p>}
                {featuredSermon.scripture && <p className="mt-3 font-serif text-body-sm italic text-warm">{featuredSermon.scripture}</p>}
                {featuredSermon.description && <p className="mt-3 line-clamp-3 text-body-sm text-white/70">{featuredSermon.description}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-white/60">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {featuredSermon.speakerName}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(featuredSermon.date).toLocaleDateString()}</span>
                  {featuredSermon.duration && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {featuredSermon.duration} min</span>}
                </div>
                {featuredSermon.youtubeUrl && extractYouTubeId(featuredSermon.youtubeUrl) && (
                  <Button className="mt-5" leftIcon={<Video className="h-4 w-4" />} onClick={() => watchSermon(featuredSermon)}>
                    Watch Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section spacing="sm" className="bg-surface">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Input
            placeholder="Search sermons..."
            aria-label="Search sermons"
            leftIcon={<Search />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md md:w-80"
          />

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            {renderFilterControls()}
          </div>

          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="secondary" leftIcon={<SlidersHorizontal className="h-4 w-4" />} className="md:hidden">
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetTitle className="sr-only">Filter Sermons</SheetTitle>
              <div className="flex flex-col gap-3 p-4 pt-8">
                {renderFilterControls(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {series.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption text-foreground-subtle">Browse by series:</span>
            {series.map((s) => (
              <Link
                key={s.id}
                href={`/sermons/series/${s.id}`}
                className="border border-border px-3 py-1 text-caption font-medium text-foreground-muted transition-colors hover:border-accent hover:text-accent"
              >
                {s.title}
              </Link>
            ))}
          </div>
        )}

        {scriptureBooks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption text-foreground-subtle">Browse by book:</span>
            {scriptureBooks.map((book) => (
              <button
                key={book}
                onClick={() => setSelectedBook(selectedBook === book ? null : book)}
                className={cn(
                  'border px-3 py-1 text-caption font-medium transition-colors',
                  selectedBook === book ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-foreground-muted hover:border-accent hover:text-accent'
                )}
              >
                {book}
              </button>
            ))}
          </div>
        )}

        {selectedSpeakerBio && (
          <Card className="mx-auto mt-6 flex max-w-2xl items-start gap-4">
            <Avatar src={selectedSpeakerBio.imageUrl} name={selectedSpeakerBio.name} size="lg" />
            <div>
              <h3 className="font-display text-title-md text-foreground">{selectedSpeakerBio.name}</h3>
              {selectedSpeakerBio.bio && <p className="mt-1 text-body-sm text-foreground-muted">{selectedSpeakerBio.bio}</p>}
            </div>
          </Card>
        )}
      </Section>

      <Section spacing="lg">
        {filteredSermons.length === 0 ? (
          <EmptyState as="h2" icon={BookOpen} title="No sermons found" description="Check back soon for new sermons!" />
        ) : viewMode === 'timeline' ? (
          <div className="space-y-10">
            {Object.entries(groupedSermons)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([yearMonth, group]) => (
                <div key={yearMonth} className="border-l-2 border-accent pl-6">
                  <h3 className="mb-4 font-mono text-label font-semibold uppercase tracking-wide text-accent">{group.monthName}</h3>
                  <div className="space-y-3">
                    {group.sermons.map((sermon) => (
                      <Card key={sermon.id} className="flex items-start gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-surface-active">
                          {sermon.imageUrl ? (
                            <Image src={sermon.imageUrl} alt={sermon.title} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Play className="h-5 w-5 text-foreground-subtle" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display text-title-sm text-foreground">{sermon.title}</h4>
                          <p className="text-body-sm text-foreground-muted">{sermon.speakerName} · {new Date(sermon.date).toLocaleDateString()}</p>
                          {sermon.scripture && <p className="text-caption text-warm">📖 {sermon.scripture}</p>}
                        </div>
                        <IconButton
                          label={queue.includes(sermon.id) ? 'Remove from queue' : 'Save for later'}
                          size="sm"
                          onClick={(e) => onToggleQueue(e, sermon.id)}
                        >
                          {queue.includes(sermon.id) ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
                        </IconButton>
                        {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                          <Button size="sm" onClick={() => watchSermon(sermon)}>Watch</Button>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Grid cols={3} gap={6}>
            {filteredSermons.map((sermon, index) => (
              <motion.div
                key={sermon.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
              >
                <Card padding="none" className="h-full overflow-hidden">
                  <div className="relative aspect-video bg-surface-active">
                    {sermon.imageUrl || sermon.youtubeUrl ? (
                      <Image
                        src={sermon.imageUrl || `https://img.youtube.com/vi/${extractYouTubeId(sermon.youtubeUrl || '')}/maxresdefault.jpg`}
                        alt={sermon.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                        <button
                          onClick={() => watchSermon(sermon)}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg transition-transform hover:scale-105"
                        >
                          <Play className="ml-0.5 h-6 w-6 text-accent-foreground" />
                        </button>
                      )}
                    </div>
                    {sermon.duration && <Badge variant="neutral" className="absolute bottom-2 right-2 bg-background/90">{sermon.duration}min</Badge>}
                    {sermon.featured && <Badge variant="warning" className="absolute top-2 left-2">Featured</Badge>}
                    <IconButton
                      label={queue.includes(sermon.id) ? 'Remove from queue' : 'Save for later'}
                      size="sm"
                      className="absolute top-2 right-2 bg-background/90"
                      onClick={(e) => onToggleQueue(e, sermon.id)}
                    >
                      {queue.includes(sermon.id) ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
                    </IconButton>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      {sermon.seriesTitle && seriesIdByTitle.has(sermon.seriesTitle) ? (
                        <Link href={`/sermons/series/${seriesIdByTitle.get(sermon.seriesTitle)}`} className="text-caption font-semibold text-accent hover:underline">
                          {sermon.seriesTitle}
                        </Link>
                      ) : (
                        <span className="text-caption font-semibold text-accent">{sermon.seriesTitle}</span>
                      )}
                      {sermon.duration && (
                        <span className="flex items-center gap-1 text-caption text-foreground-subtle">
                          <Clock className="h-3 w-3" /> {sermon.duration}min
                        </span>
                      )}
                    </div>
                    <h3 className="line-clamp-2 font-display text-title-md text-foreground">{sermon.title}</h3>
                    {sermon.scripture && <p className="mt-1.5 text-caption font-medium text-warm">📖 {sermon.scripture}</p>}
                    {sermon.description && <p className="mt-2 line-clamp-2 text-body-sm text-foreground-muted">{sermon.description}</p>}
                    <div className="mt-3 flex items-center gap-3 text-caption text-foreground-subtle">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {sermon.speakerName}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(sermon.date).toLocaleDateString()}</span>
                    </div>
                    {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                      <Button size="sm" fullWidth className="mt-4" leftIcon={<Play className="h-3.5 w-3.5" />} onClick={() => watchSermon(sermon)}>
                        Watch
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </Section>

      <Modal isOpen={showLiveStream} onClose={() => setShowLiveStream(false)} title="Live Stream" size="xl">
        <Suspense fallback={<LoadingState label="Loading stream..." />}>
          <DynamicLiveStream />
        </Suspense>
      </Modal>

      <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} title={selectedVideo?.title} size="xl">
        {selectedVideo && (
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl || '') || ''}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
