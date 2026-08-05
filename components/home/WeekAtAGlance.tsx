'use client';

import Link from 'next/link';
import { Clock, Calendar, Megaphone } from 'lucide-react';
import { ServiceTime, EventItem, Announcement } from '@/lib/content';
import { Card } from '@/components/ui-legacy/Card';

interface Props {
  nextService: ServiceTime | null;
  weekEvents: EventItem[];
  latestAnnouncement: Announcement | null;
}

export default function WeekAtAGlance({ nextService, weekEvents, latestAnnouncement }: Props) {
  const tiles = [
    nextService && {
      icon: Clock,
      label: 'Next Service',
      title: nextService.title,
      detail: `${nextService.time}${nextService.location ? ` · ${nextService.location}` : ''}`,
      href: '/services',
    },
    weekEvents.length > 0 && {
      icon: Calendar,
      label: weekEvents.length === 1 ? 'This Week' : `This Week (${weekEvents.length})`,
      title: weekEvents[0].title,
      detail: new Date(weekEvents[0].startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      href: '/events',
    },
    latestAnnouncement && {
      icon: Megaphone,
      label: 'Latest News',
      title: latestAnnouncement.title,
      detail: latestAnnouncement.date ? new Date(latestAnnouncement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
      href: '#announcements',
    },
  ].filter(Boolean) as { icon: typeof Clock; label: string; title: string; detail: string; href: string }[];

  if (tiles.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Link key={tile.label} href={tile.href}>
          <Card variant="interactive" padding="md" className="h-full">
            <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-accent">
              <tile.icon className="h-3.5 w-3.5" /> {tile.label}
            </p>
            <p className="line-clamp-1 text-title-sm text-foreground">{tile.title}</p>
            <p className="mt-1 text-body-sm text-foreground-muted">{tile.detail}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
