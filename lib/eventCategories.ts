import type { BadgeVariant } from '@/components/ui/Badge';

export interface EventCategory {
  id: string;
  label: string;
  /** Solid dot/swatch color, used in the calendar and filter chips. */
  dotClass: string;
  /** Selected filter-chip background/text. */
  chipActiveClass: string;
  badgeVariant: BadgeVariant;
}

// `dotClass` is paired with `text-white` on small pill/badge labels in
// several places (InteractiveCalendar, events list), not just used as a
// plain decorative swatch, so — like `chipActiveClass` — it needs a shade
// that clears WCAG AA's 4.5:1 text contrast minimum against white. Plain
// Tailwind -500 shades range from 2.3:1 to 4.0:1 and fail; -600 clears it
// for most hues, green and orange need -700 (verified numerically).
export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'all', label: 'All Events', dotClass: 'bg-zinc-600', chipActiveClass: 'bg-zinc-600 text-white', badgeVariant: 'neutral' },
  { id: 'regular-service', label: 'Regular Services', dotClass: 'bg-blue-600', chipActiveClass: 'bg-blue-600 text-white', badgeVariant: 'info' },
  { id: 'special', label: 'Special Events', dotClass: 'bg-purple-600', chipActiveClass: 'bg-purple-600 text-white', badgeVariant: 'accent' },
  { id: 'ministry', label: 'Ministry Events', dotClass: 'bg-green-700', chipActiveClass: 'bg-green-700 text-white', badgeVariant: 'success' },
  { id: 'community', label: 'Community', dotClass: 'bg-orange-700', chipActiveClass: 'bg-orange-700 text-white', badgeVariant: 'warning' },
  { id: 'youth', label: 'Youth Events', dotClass: 'bg-pink-600', chipActiveClass: 'bg-pink-600 text-white', badgeVariant: 'danger' },
  { id: 'worship', label: 'Worship Events', dotClass: 'bg-indigo-600', chipActiveClass: 'bg-indigo-600 text-white', badgeVariant: 'accent' },
];

export function getEventCategory(id: string): EventCategory {
  return EVENT_CATEGORIES.find((c) => c.id === id) ?? { id, label: id, dotClass: 'bg-zinc-600', chipActiveClass: 'bg-zinc-600 text-white', badgeVariant: 'neutral' };
}

/**
 * Expands weekly service times into synthetic recurring Event-shaped
 * objects for calendar/list display. Shared by the events list page and
 * the interactive calendar, which each need the same weeks-of-Sundays
 * expansion but previously reimplemented it slightly differently.
 */
export function expandServicesToEvents<T extends { id: string; title: string; description?: string; location: string; time: string }>(
  services: T[],
  weeksAhead = 8
): Array<{
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  location: string;
  category: string;
  recurring: true;
  featured: false;
  isPublic: true;
  cost: number;
  registrationRequired: false;
}> {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  if (nextSunday.getDay() === 0 && nextSunday < now) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  const events: ReturnType<typeof expandServicesToEvents> = [];
  services.forEach((service) => {
    if (!service.time || !service.time.includes(':')) return;
    const [hours, minutes] = service.time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    for (let i = 0; i < weeksAhead; i++) {
      const serviceDate = new Date(nextSunday);
      serviceDate.setDate(nextSunday.getDate() + i * 7);
      serviceDate.setHours(hours, minutes, 0, 0);
      if (isNaN(serviceDate.getTime())) continue;

      events.push({
        id: `service-${service.id}-${i}`,
        title: service.title,
        description: service.description,
        shortDescription: service.description,
        startDate: serviceDate.toISOString(),
        location: service.location,
        category: 'regular-service',
        recurring: true,
        featured: false,
        isPublic: true,
        cost: 0,
        registrationRequired: false,
      });
    }
  });
  return events;
}
