import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { EventItem } from '@/lib/content';
import { Badge } from '@/components/ui/badge';

// A horizontally-scrollable strip rather than a fixed 3-up grid — events
// are chronological and can run longer than 3 items without needing a
// "view all" click, and this keeps the section visually distinct from the
// blog's featured+list layout below it instead of repeating the same
// image-top card grid twice on one page.
export default function UpcomingEventsStrip({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="group block w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-border-strong"
        >
          <div className="relative aspect-16/10 bg-surface-active">
            {event.imageUrl ? (
              <Image src={event.imageUrl} alt={event.title} fill sizes="256px" className="object-cover transition-transform duration-slow group-hover:scale-105" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-8 w-8 text-foreground-subtle" />
              </div>
            )}
          </div>
          <div className="p-4">
            <Badge variant="neutral" className="mb-2">{event.category}</Badge>
            <h3 className="text-title-sm text-foreground">{event.title}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-body-sm text-foreground-muted">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-body-sm text-foreground-muted">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
