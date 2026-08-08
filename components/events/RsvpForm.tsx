'use client';

import { useState } from 'react';
import { CheckCircle2, Clock3, Download, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/button';
import { ConfettiBurst } from '@/components/ui/confetti-burst';

export function RsvpForm({ eventId, maxAttendees }: { eventId: string; maxAttendees?: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [headcount, setHeadcount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string } | null>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, headcount }),
      });
      const data = await res.json();
      if (data.success) setResult({ status: data.status });
      else setError(data.message || 'Failed to submit RSVP.');
    } catch {
      setError('Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRsvp = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/events/${eventId}/rsvp?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      setResult(null);
      setName(''); setEmail('');
    } catch {
      setError('Failed to cancel. Please try again or contact us.');
    } finally {
      setCancelling(false);
    }
  };

  if (result) {
    return (
      <Card variant="raised" padding="lg" className="relative overflow-visible">
        {result.status === 'confirmed' && <ConfettiBurst />}
        <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${result.status === 'confirmed' ? 'bg-success-subtle' : 'bg-warning-subtle'}`}>
          {result.status === 'confirmed' ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Clock3 className="h-6 w-6 text-warning" />}
        </div>
        <p className="text-center text-title-sm text-foreground">
          {result.status === 'confirmed' ? "You're confirmed!" : "You're on the waitlist"}
        </p>
        <p className="mt-1 text-center text-body-sm text-foreground-muted">
          {result.status === 'confirmed'
            ? `A confirmation has been sent to ${email}.`
            : "We'll email you if a spot opens up."}
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <LinkButton href={`/api/events/ical?email=${encodeURIComponent(email)}`} variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Add to My Calendar
          </LinkButton>
          <button onClick={cancelRsvp} disabled={cancelling} className="flex items-center gap-1 text-caption text-foreground-subtle hover:text-danger">
            <X className="h-3 w-3" /> {cancelling ? 'Cancelling...' : 'Cancel my RSVP'}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="raised" padding="lg">
      <p className="mb-4 text-title-sm text-foreground">RSVP for this event</p>
      <form onSubmit={submit} className="space-y-3">
        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} size="sm" />
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} size="sm" />
        <Input
          label="Number attending"
          type="number"
          min={1}
          max={20}
          required
          value={headcount}
          onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value, 10) || 1))}
          size="sm"
        />
        {error && <p className="text-caption text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={submitting}>{submitting ? 'Submitting...' : 'RSVP'}</Button>
        {maxAttendees && <p className="text-center text-caption text-foreground-subtle">Limited to {maxAttendees} attendees — you may be waitlisted if it&apos;s full.</p>}
      </form>
    </Card>
  );
}
