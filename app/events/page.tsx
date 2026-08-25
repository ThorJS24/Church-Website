import { Calendar } from 'lucide-react';
import { getEvents, getServiceTimes, EventItem as Event } from '@/lib/content';
import { expandServicesToEvents } from '@/lib/eventCategories';
import InteractiveCalendar from '@/components/InteractiveCalendar';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { EventsBrowser } from '@/components/events/EventsBrowser';

export const revalidate = 300;

export default async function EventsPage() {
  const [eventsData, servicesData] = await Promise.all([getEvents(), getServiceTimes()]);
  const recurring = expandServicesToEvents(servicesData || []);
  const events = [...(eventsData || []), ...(recurring as unknown as Event[])];

  return (
    <div>
      <PageHero icon={<Calendar />} eyebrow="What's Happening" title="Events" description="What, when, where, and who — worship, fellowship, and community gatherings." />

      <Section spacing="lg" className="border-b border-border">
        <h2 className="mb-6 font-display text-headline-md text-foreground">Calendar</h2>
        <InteractiveCalendar />
      </Section>

      <EventsBrowser initialEvents={events} />
    </div>
  );
}
