'use client';

import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface AddToCalendarButtonProps {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  className?: string;
}

function toGoogleDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}

/**
 * Single-event "add to calendar" — deliberately client-only, no API call.
 * Google Calendar accepts a plain URL; Apple/Outlook get a one-event .ics
 * blob generated in the browser using the same escaping/format as the
 * personal-feed export in /api/events/ical, just scoped to one event.
 */
export function AddToCalendarButton({ title, description, location, startDate, endDate, className }: AddToCalendarButtonProps) {
  const end = endDate || startDate;

  const googleUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGoogleDate(startDate)}/${toGoogleDate(end)}`,
    details: description || '',
    location: location || '',
  })}`;

  const downloadICS = () => {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Salem Primitive Baptist Church//Event//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@salempbc.in`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${escapeICS(title)}`,
      `LOCATION:${escapeICS(location || '')}`,
      `DESCRIPTION:${escapeICS(description || '')}`,
      'END:VEVENT', 'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={className} leftIcon={<CalendarPlus className="h-4 w-4" />}>
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => window.open(googleUrl, '_blank', 'noopener,noreferrer')}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadICS}>
          Apple / Outlook (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
