'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Building, Award, Heart, Search, Play, Pause, Star } from 'lucide-react';
import { getHistoryTimeline, TimelineEvent } from '@/lib/content';
import Image from 'next/image';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/states';

const CATEGORY_ICONS: Record<string, typeof Clock> = {
  foundation: Building,
  growth: Users,
  ministry: Heart,
  building: Building,
  leadership: Award,
  community: Users,
  milestone: Award,
};

export default function HistoryPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    getHistoryTimeline()
      .then(setTimelineEvents)
      .catch((error) => console.error('Error fetching timeline events:', error))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = timelineEvents
    .filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
    .filter(
      (e) =>
        !searchTerm ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    if (!isAutoPlay || filteredEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        const next = (prev + 1) % filteredEvents.length;
        document.getElementById(`event-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, filteredEvents.length]);

  const categories = ['all', ...Array.from(new Set(timelineEvents.map((e) => e.category)))];
  const stats = {
    totalEvents: timelineEvents.length,
    yearsSpanned:
      timelineEvents.length > 0 ? Math.max(...timelineEvents.map((e) => e.year)) - Math.min(...timelineEvents.map((e) => e.year)) : 0,
    featuredEvents: timelineEvents.filter((e) => e.featured).length,
    categories: new Set(timelineEvents.map((e) => e.category)).size,
  };

  if (loading) return <LoadingState label="Loading church history..." />;

  return (
    <div>
      <PageHero
        icon={<Clock />}
        eyebrow="Our Story"
        title="Our History"
        description="A legacy of faith and service to our community"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'History' }]}
        actions={
          <Grid cols={4} gap={3} className="mx-auto mt-2 max-w-lg text-center">
            {[
              { value: stats.totalEvents, label: 'Events' },
              { value: `${stats.yearsSpanned}+`, label: 'Years' },
              { value: stats.featuredEvents, label: 'Milestones' },
              { value: stats.categories, label: 'Categories' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-title-lg text-foreground">{s.value}</div>
                <div className="text-caption text-foreground-subtle">{s.label}</div>
              </div>
            ))}
          </Grid>
        }
      />

      <Section spacing="lg">
        <Card className="mb-10 flex flex-col items-center gap-4 lg:flex-row">
          <Input
            placeholder="Search timeline events..."
            aria-label="Search timeline events"
            leftIcon={<Search />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map((c) => ({ value: c, label: c === 'all' ? 'All Categories' : c }))}
            className="w-auto capitalize"
          />
          <Button
            variant={isAutoPlay ? 'primary' : 'secondary'}
            leftIcon={isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? 'Pause' : 'Auto-play'}
          </Button>
          <p className="ml-auto text-caption text-foreground-subtle">
            Showing {filteredEvents.length} of {timelineEvents.length} events
          </p>
        </Card>

        {filteredEvents.length === 0 ? (
          <EmptyState icon={Clock} title="No timeline events available" description="Add timeline events through the admin panel to display church history." />
        ) : (
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 hidden w-px bg-border sm:block" />
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {filteredEvents.map((event, index) => {
                  const Icon = CATEGORY_ICONS[event.category] ?? Clock;
                  const isCurrent = isAutoPlay && index === currentEventIndex;
                  return (
                    <motion.div
                      key={event.id}
                      id={`event-${index}`}
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ delay: index * 0.03, duration: 0.4 }}
                      className="relative flex items-start gap-6"
                    >
                      <div
                        className={`relative z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle text-accent sm:flex ${isCurrent ? 'ring-2 ring-accent' : ''}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                        {event.featured && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-warm text-warm-foreground">
                            <Star className="h-3 w-3 fill-current" />
                          </span>
                        )}
                      </div>

                      <Card
                        variant="interactive"
                        className={`flex-1 ${isCurrent ? 'border-accent shadow-md' : ''}`}
                        onClick={() => setCurrentEventIndex(index)}
                      >
                        <div className="flex flex-col gap-5 lg:flex-row">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-2">
                              <Badge variant="accent">{event.year}</Badge>
                              <Badge variant="neutral" className="capitalize">{event.category}</Badge>
                            </div>
                            <h3 className="text-title-lg text-foreground">{event.title}</h3>
                            <p className="mt-2 text-body-sm leading-relaxed text-foreground-muted">{event.description}</p>
                          </div>
                          {event.imageUrl && (
                            <div className="relative aspect-video overflow-hidden rounded-lg lg:w-1/3">
                              <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width: 1024px) 100vw, 300px" className="object-cover" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredEvents.length > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                {isAutoPlay && (
                  <div className="flex gap-2">
                    {filteredEvents.map((_, index) => (
                      <button
                        key={index}
                        aria-label={`Go to event ${index + 1}`}
                        onClick={() => setCurrentEventIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-base ${index === currentEventIndex ? 'w-8 bg-accent' : 'w-1.5 bg-border-strong hover:bg-foreground-subtle'}`}
                      />
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setCurrentEventIndex((prev) => (prev === 0 ? filteredEvents.length - 1 : prev - 1))}>
                    Previous
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentEventIndex((prev) => (prev + 1) % filteredEvents.length)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
