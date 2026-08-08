import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Camera } from 'lucide-react';
import { getEventById, getEvents, getEventGalleries } from '@/lib/content';
import { getEventCategory } from '@/lib/eventCategories';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { AddToCalendarButton } from '@/components/AddToCalendarButton';
import { EventCountdown } from '@/components/EventCountdown';
import { RsvpForm } from '@/components/events/RsvpForm';
import { AttendeeCount } from '@/components/events/AttendeeCount';
import { AlertTriangle } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: 'Event not found — Salem Primitive Baptist Church' };

  const title = `${event.title} — Salem Primitive Baptist Church`;
  const description = event.shortDescription || event.description || `Join us for ${event.title} at Salem Primitive Baptist Church.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://salempbc.in/events/${event.id}`,
      images: event.imageUrl ? [{ url: event.imageUrl, width: 1200, height: 630, alt: event.title }] : undefined,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const allEvents = await getEvents();
  const relatedEvents = allEvents
    .filter((e) => e.id !== event.id && e.category === event.category)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const isPastEvent = new Date(event.startDate).getTime() < Date.now();
  const eventGalleries = isPastEvent ? await getEventGalleries() : [];
  const eventPhotos = eventGalleries.find((g) => g.id === event.id)?.photos ?? [];

  const category = event.category ? getEventCategory(event.category) : null;
  const mapQuery = encodeURIComponent(event.address || event.location);

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.location, address: event.address || event.location },
    description: event.description || event.shortDescription || event.title,
    image: event.imageUrl || undefined,
    organizer: { '@type': 'Organization', name: 'Salem Primitive Baptist Church', url: 'https://salempbc.in' },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <Section spacing="lg">
        <Container size="md">
          <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: event.title }]} className="mb-6" />

          {event.cancelled && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" /> This event has been cancelled.
            </div>
          )}

          {category && <Badge variant={category.badgeVariant} className="mb-3">{category.label}</Badge>}
          <h1 className="font-serif text-display-sm text-foreground">{event.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(event.startDate).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>
          </div>

          {event.imageUrl && (
            <div className="relative mt-8 h-64 w-full overflow-hidden rounded-xl bg-surface-active sm:h-96">
              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              {(event.description || event.shortDescription) && (
                <p className="text-body-lg leading-relaxed text-foreground-muted">{event.description || event.shortDescription}</p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <ShareButton title={event.title} />
                {!event.cancelled && (
                  <AddToCalendarButton
                    title={event.title}
                    description={event.shortDescription || event.description}
                    location={event.location}
                    startDate={event.startDate}
                    endDate={event.endDate}
                  />
                )}
                {!event.cancelled && event.registrationRequired && event.registrationUrl && (
                  <LinkButton href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                    Register
                  </LinkButton>
                )}
              </div>
            </div>
            <div className="space-y-6">
              {!event.cancelled && <EventCountdown startDate={event.startDate} />}
              {!event.cancelled && event.registrationRequired && !event.registrationUrl && (
                <>
                  <AttendeeCount eventId={event.id} className="flex items-center gap-2 text-body-sm text-foreground-muted" />
                  <RsvpForm eventId={event.id} maxAttendees={event.maxAttendees} />
                </>
              )}
              <Card padding="none" className="overflow-hidden">
                <div className="h-48">
                  <iframe
                    title={`Map for ${event.title}`}
                    src={`https://maps.google.com/maps?q=${mapQuery}&hl=en&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 text-body-sm text-foreground-muted">
                  <Clock className="h-4 w-4 shrink-0" />
                  {new Date(event.startDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  {event.endDate && <span> – {new Date(event.endDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {eventPhotos.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <Container size="md">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-title-lg text-foreground">
                <Camera className="h-5 w-5 text-accent" /> Photos from this event
              </h2>
              <Link href={`/gallery?event=${event.id}`} className="text-body-sm font-medium text-accent hover:text-accent-hover">
                View all {eventPhotos.length} photos →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {eventPhotos.slice(0, 6).map((photo) => (
                <Link key={photo.id} href={`/gallery?event=${event.id}`} className="relative block aspect-square overflow-hidden rounded-lg bg-surface-active">
                  <Image src={photo.imageUrl} alt={photo.title || 'Event photo'} fill sizes="200px" className="object-cover transition-transform duration-slow hover:scale-105" />
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {relatedEvents.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <Container size="md">
            <h2 className="mb-6 text-title-lg text-foreground">Related Events</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedEvents.map((related) => (
                <Link key={related.id} href={`/events/${related.id}`} className="block h-full">
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-video bg-surface-active">
                      {related.imageUrl && <Image src={related.imageUrl} alt={related.title} fill sizes="300px" className="object-cover" />}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-body-sm font-medium text-foreground">{related.title}</p>
                      <p className="mt-1 text-caption text-foreground-subtle">{new Date(related.startDate).toLocaleDateString()}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
