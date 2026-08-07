'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

export function EventCountdown({ startDate }: { startDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(startDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(startDate)), 60_000);
    return () => clearInterval(interval);
  }, [startDate]);

  if (!timeLeft) return null;

  return (
    <Card variant="raised" padding="lg" className="text-center">
      <p className="mb-4 text-label uppercase tracking-wide text-foreground-subtle">Starts in</p>
      <div className="flex justify-center gap-6">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Minutes' },
        ].map((unit) => (
          <div key={unit.label}>
            <div className="text-display-sm text-accent">{unit.value}</div>
            <div className="text-caption text-foreground-subtle">{unit.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
