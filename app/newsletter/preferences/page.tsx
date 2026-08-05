'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Checkbox } from '@/components/ui-legacy/Checkbox';
import { Button } from '@/components/ui-legacy/Button';
import { LoadingState } from '@/components/ui-legacy/States';

// The topic list an admin can segment campaigns by — kept as a fixed set
// here (rather than free-text tagging like the admin side) since visitors
// need known choices, not an open text field.
const TOPICS = ['events', 'sermons', 'youth', 'missions', 'prayer'];

function PreferencesForm() {
  const params = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); setError('This link is missing its token.'); return; }
    fetch(`/api/newsletter/preferences?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) { setEmail(data.subscriber.email); setTags(data.subscriber.tags || []); }
        else setError(data.message || 'This link is invalid or has expired.');
      })
      .catch(() => setError('Failed to load your preferences.'))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleTopic = (topic: string) => {
    setTags((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/newsletter/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tags }),
      });
      const data = await response.json();
      if (data.success) setSaved(true);
      else setError(data.message || 'Failed to save your preferences.');
    } catch {
      setError('Failed to save your preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading your preferences..." />;

  return (
    <Card variant="raised" padding="lg">
      {error ? (
        <p className="text-body-md text-danger">{error}</p>
      ) : saved ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <p className="text-body-md text-foreground-muted">Your preferences have been saved.</p>
        </div>
      ) : (
        <>
          <h1 className="text-headline-sm text-foreground">Email Preferences</h1>
          <p className="mt-2 text-body-sm text-foreground-muted">{email}</p>
          <p className="mt-4 text-body-sm text-foreground-muted">Choose which topics you&apos;d like to hear about. Leave all unchecked to receive every newsletter.</p>
          <div className="mt-4 space-y-3">
            {TOPICS.map((topic) => (
              <Checkbox key={topic} label={topic.charAt(0).toUpperCase() + topic.slice(1)} checked={tags.includes(topic)} onChange={() => toggleTopic(topic)} />
            ))}
          </div>
          <Button className="mt-6" fullWidth loading={saving} onClick={save}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
        </>
      )}
    </Card>
  );
}

export default function NewsletterPreferencesPage() {
  return (
    <Container size="sm" className="py-16">
      <Suspense fallback={<LoadingState label="Loading..." />}>
        <PreferencesForm />
      </Suspense>
    </Container>
  );
}
