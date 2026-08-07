'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export function AttendeeCount({ eventId, className }: { eventId: string; className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${eventId}/attendee-count`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.success) setCount(data.count); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [eventId]);

  if (!count) return null;

  return (
    <p className={className}>
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      {count} {count === 1 ? 'person' : 'people'} going
    </p>
  );
}
