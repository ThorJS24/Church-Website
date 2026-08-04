import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getEventById } from '@/lib/content';

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

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.address || event.location,
    },
    description: event.description || event.shortDescription || event.title,
    image: event.imageUrl || undefined,
    organizer: { '@type': 'Organization', name: 'Salem Primitive Baptist Church', url: 'https://salempbc.in' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/events" className="text-sm text-blue-600 hover:underline">&larr; Back to Events</Link>

          {event.category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-6">{event.category}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{event.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {new Date(event.startDate).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{event.location}</p>

          {event.imageUrl && (
            <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-8">
              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          )}

          {(event.description || event.shortDescription) && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{event.description || event.shortDescription}</p>
          )}

          {event.registrationRequired && event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
