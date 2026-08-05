'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { EventItem } from '@/lib/content';
import { Section } from '@/components/ui-legacy/Section';
import { Container } from '@/components/ui-legacy/Container';
import { LinkButton } from '@/components/ui-legacy/Button';

function timeParts(ms: number) {
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export default function EventCountdown({ event }: { event: EventItem | null }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!event || now === null) return null;
  const target = new Date(event.startDate).getTime();
  if (target <= now) return null;

  const { days, hours, minutes, seconds } = timeParts(target - now);
  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <Section spacing="md" className="bg-zinc-950 text-white">
      <Container className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div>
          <p className="flex items-center justify-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-white/60 sm:justify-start">
            <CalendarClock className="h-3.5 w-3.5" /> Coming up
          </p>
          <h3 className="mt-1 text-headline-sm">{event.title}</h3>
          <p className="mt-1 text-body-sm text-white/60">
            {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {event.location}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {units.map((u) => (
            <div key={u.label} className="text-center">
              <div className="tabular-nums text-display-sm">{String(u.value).padStart(2, '0')}</div>
              <div className="text-caption text-white/60">{u.label}</div>
            </div>
          ))}
        </div>
        <LinkButton href={`/events/${event.id}`} variant="secondary">View Details</LinkButton>
      </Container>
    </Section>
  );
}
