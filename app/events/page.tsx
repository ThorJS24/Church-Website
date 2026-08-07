'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Search, Star } from 'lucide-react';
import { getEvents as getEventsData, getServiceTimes, EventItem as Event } from '@/lib/content';
import { EVENT_CATEGORIES, getEventCategory, expandServicesToEvents } from '@/lib/eventCategories';
import Image from 'next/image';
import EventModal from '@/components/EventModal';
import InteractiveCalendar from '@/components/InteractiveCalendar';
import { AttendeeCount } from '@/components/events/AttendeeCount';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { LoadingState, EmptyState } from '@/components/ui/states';
import { cn } from '@/lib/utils';

const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (url: string): string => {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/images/default-event.jpg';
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const [eventsData, servicesData] = await Promise.all([getEventsData(), getServiceTimes()]);
        const recurring = expandServicesToEvents(servicesData || []);
        setEvents([...(eventsData || []), ...(recurring as unknown as Event[])]);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.shortDescription && event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilters = selectedFilters.includes('all') || selectedFilters.some((filter) => event.category === filter);
    return matchesSearch && matchesFilters;
  });

  const handleFilterChange = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedFilters(['all']);
    } else {
      const newFilters = selectedFilters.includes('all')
        ? [categoryId]
        : selectedFilters.includes(categoryId)
          ? selectedFilters.filter((f) => f !== categoryId)
          : [...selectedFilters.filter((f) => f !== 'all'), categoryId];
      setSelectedFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  if (loading) return <LoadingState label="Loading events..." />;

  return (
    <div>
      <PageHero icon={<Calendar />} eyebrow="What's Happening" title="Upcoming Events" description="Join us for worship, fellowship, and community events" />

      <Section spacing="lg">
        <h2 className="mb-6 text-center text-headline-md text-foreground">Event Calendar</h2>
        <InteractiveCalendar />
      </Section>

      <Section spacing="sm" className="bg-surface">
        <div className="mb-4 flex justify-center">
          <Input placeholder="Search events..." aria-label="Search events" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
        </div>
        <Card>
          <p className="mb-3 text-label text-foreground">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map((category) => {
              const active = selectedFilters.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange(category.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-body-sm font-medium transition-colors',
                    active ? category.chipActiveClass : 'bg-surface-active text-foreground-muted hover:bg-surface-hover'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', category.dotClass)} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </Card>
      </Section>

      <Section spacing="lg">
        {filteredEvents.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" description="Check back soon for new events and activities!" />
        ) : (
          <Grid cols={3} gap={6}>
            {filteredEvents.map((event, index) => {
              const category = getEventCategory(event.category);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
                >
                  <Card padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-16/10 bg-surface-active">
                      <Image
                        src={event.imageUrl || getYouTubeThumbnail(event.youtubeUrl || '') || '/images/default-event.jpg'}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded-full px-2.5 py-1 text-caption font-medium text-white', category.dotClass)}>
                            {event.category === 'regular-service' ? 'Weekly' : new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {event.featured && <Star className="h-4 w-4 fill-current text-warning" />}
                        </div>
                        {event.cost !== undefined && (
                          <span className="text-body-sm font-medium text-success">{event.cost === 0 ? 'Free' : `$${event.cost}`}</span>
                        )}
                      </div>

                      <h3 className="text-title-md text-foreground">{event.title}</h3>
                      {event.subtitle && <p className="mt-1 text-body-sm text-foreground-subtle">{event.subtitle}</p>}

                      <div className="mt-3 space-y-1.5 text-body-sm text-foreground-muted">
                        <p className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          {event.endDate && <span> - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>}
                        </p>
                        <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>
                        {event.registrationRequired && !event.registrationUrl && (
                          <AttendeeCount eventId={event.id} className="flex items-center gap-2" />
                        )}
                      </div>

                      {event.shortDescription && <p className="mt-3 line-clamp-2 text-body-sm text-foreground-muted">{event.shortDescription}</p>}

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" fullWidth onClick={() => setSelectedEvent(event)}>Learn More</Button>
                        {event.registrationRequired && event.registrationUrl && (
                          <LinkButton href={event.registrationUrl} target="_blank" rel="noopener noreferrer" size="sm" variant="secondary">
                            Register
                          </LinkButton>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        )}
      </Section>

      <EventModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
