'use client';

import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, User, Clock, Search, BookOpen, Video, Radio, History, Bookmark, BookmarkCheck } from 'lucide-react';
import { getSermons, getSeriesList, getSpeakersList, getLivestream, Sermon } from '@/lib/content';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';
import Image from 'next/image';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';

const DynamicLiveStream = lazy(() => import('@/components/DynamicLiveStream'));

const RECENT_KEY = 'salempbc:recentlyWatchedSermons';
const QUEUE_KEY = 'salempbc:sermonQueue';

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

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All Speakers');
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Sermon | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState<Array<{ id: string; title: string; watchedAt: number }>>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [queueOnly, setQueueOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sermonsData, seriesData, speakersData, livestreamData] = await Promise.all([
          getSermons(20),
          getSeriesList(),
          getSpeakersList(),
          getLivestream(),
        ]);
        setSermons(sermonsData);
        setSeries(seriesData);
        setSpeakers(speakersData);
        if (livestreamData) setHasLiveStream(livestreamData.isLive);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    setRecentlyWatched(getRecentlyWatched());
    setQueue(getQueue());
  }, []);

  const featuredSermon = sermons[0] || null;

  const scriptureBooks = useMemo(
    () => Array.from(new Set(sermons.filter((s) => s.scripture).map((s) => scriptureBook(s.scripture!)))).sort(),
    [sermons]
  );

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

  if (loading) return <LoadingState label="Loading sermons..." />;

  return (
    <div>
      <PageHero
        icon={<BookOpen />}
        eyebrow="Sermon Library"
        title="Sermons"
        description="Be encouraged and challenged by God's Word through our sermon library"
        actions={
          hasLiveStream ? (
            <Button variant="danger" leftIcon={<Radio className="h-4 w-4 animate-pulse" />} onClick={() => setShowLiveStream(true)}>
              Watch Live Stream
            </Button>
          ) : (
            <Badge variant="neutral"><Radio className="h-4 w-4" /> No Live Stream Currently</Badge>
          )
        }
      />

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
                  className="shrink-0 rounded-lg border border-border bg-background px-4 py-2.5 text-left text-body-sm text-foreground transition-colors hover:border-accent"
                >
                  {sermon.title}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {featuredSermon && (
        <Section spacing="lg">
          <h2 className="mb-8 text-center text-headline-md text-foreground">Latest Sermon</h2>
          <Card variant="raised" padding="none" className="mx-auto max-w-4xl overflow-hidden">
            <div className="md:flex">
              <div className="relative h-64 shrink-0 bg-zinc-900 md:h-auto md:w-1/2">
                {featuredSermon.imageUrl ? (
                  <Image src={featuredSermon.imageUrl} alt={featuredSermon.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
              <div className="flex-1 p-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-accent">{featuredSermon.seriesTitle}</span>
                  <Badge variant="warning">Latest</Badge>
                </div>
                <h3 className="text-headline-sm text-foreground">{featuredSermon.title}</h3>
                {featuredSermon.subtitle && <p className="mt-1 text-body-sm text-foreground-muted">{featuredSermon.subtitle}</p>}
                {featuredSermon.scripture && <p className="mt-3 text-body-sm font-medium text-warm">📖 {featuredSermon.scripture}</p>}
                {featuredSermon.description && <p className="mt-3 line-clamp-3 text-body-sm text-foreground-muted">{featuredSermon.description}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
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
          </Card>
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
          <div className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Filter by series"
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              options={[{ value: 'All Series', label: 'All Series' }, ...series.map((s) => ({ value: s.title, label: s.title }))]}
              className="w-auto"
            />
            <Select
              aria-label="Filter by speaker"
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              options={[{ value: 'All Speakers', label: 'All Speakers' }, ...speakers.map((s) => ({ value: s.name, label: s.name }))]}
              className="w-auto"
            />
            <div className="flex rounded-lg bg-surface-active p-1">
              {(['grid', 'timeline'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-body-sm capitalize transition-colors',
                    viewMode === mode ? 'bg-background text-foreground shadow-xs' : 'text-foreground-muted'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button
              onClick={() => setQueueOnly((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm transition-colors',
                queueOnly ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-muted hover:text-foreground'
              )}
            >
              {queueOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              My Queue {queue.length > 0 && `(${queue.length})`}
            </button>
          </div>
        </div>

        {scriptureBooks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption text-foreground-subtle">Browse by book:</span>
            {scriptureBooks.map((book) => (
              <button
                key={book}
                onClick={() => setSelectedBook(selectedBook === book ? null : book)}
                className={cn(
                  'rounded-full px-3 py-1 text-caption font-medium transition-colors',
                  selectedBook === book ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-muted hover:text-foreground'
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
              <h3 className="text-title-md text-foreground">{selectedSpeakerBio.name}</h3>
              {selectedSpeakerBio.bio && <p className="mt-1 text-body-sm text-foreground-muted">{selectedSpeakerBio.bio}</p>}
            </div>
          </Card>
        )}
      </Section>

      <Section spacing="lg">
        {filteredSermons.length === 0 ? (
          <EmptyState icon={BookOpen} title="No sermons found" description="Check back soon for new sermons!" />
        ) : viewMode === 'timeline' ? (
          <div className="space-y-10">
            {Object.entries(groupedSermons)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([yearMonth, group]) => (
                <div key={yearMonth} className="border-l-2 border-accent/30 pl-6">
                  <h3 className="mb-4 text-title-lg text-accent">{group.monthName}</h3>
                  <div className="space-y-3">
                    {group.sermons.map((sermon) => (
                      <Card key={sermon.id} className="flex items-start gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-active">
                          {sermon.imageUrl ? (
                            <Image src={sermon.imageUrl} alt={sermon.title} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Play className="h-5 w-5 text-foreground-subtle" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-title-sm text-foreground">{sermon.title}</h4>
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
                  <div className="relative aspect-video bg-zinc-900">
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
                      <span className="text-caption font-semibold text-accent">{sermon.seriesTitle}</span>
                      {sermon.duration && (
                        <span className="flex items-center gap-1 text-caption text-foreground-subtle">
                          <Clock className="h-3 w-3" /> {sermon.duration}min
                        </span>
                      )}
                    </div>
                    <h3 className="line-clamp-2 text-title-md text-foreground">{sermon.title}</h3>
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
