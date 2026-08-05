'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Clock, Heart, Droplets } from 'lucide-react';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Input } from '@/components/ui-legacy/Input';
import { Button } from '@/components/ui-legacy/Button';
import { LoadingState } from '@/components/ui-legacy/States';
import { cn } from '@/lib/cn';

interface RequestStatus {
  serviceType: string;
  status: string;
  preferredDate?: string;
  submittedAt?: string;
  updatedAt?: string;
}

const STEPS = [
  { key: 'pending', label: 'Submitted' },
  { key: 'contacted', label: 'Team Reached Out' },
  { key: 'closed', label: 'Scheduled / Complete' },
];

function StatusForm() {
  const params = useSearchParams();
  const [id, setId] = useState(params.get('id') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [result, setResult] = useState<RequestStatus | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const lookup = async (lookupId: string, lookupEmail: string) => {
    if (!lookupId || !lookupEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/request/${lookupId}?email=${encodeURIComponent(lookupEmail)}`);
      const data = await res.json();
      setResult(data.success ? data.request : null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get('id') && params.get('email')) lookup(params.get('id')!, params.get('email')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = result ? Math.max(0, STEPS.findIndex((s) => s.key === result.status)) : -1;

  return (
    <Container size="sm" className="py-16">
      <Card variant="raised" padding="lg">
        <h1 className="text-headline-sm text-foreground">Track Your Request</h1>
        <p className="mt-2 text-body-sm text-foreground-muted">Enter the request ID from your confirmation email and the email you submitted with.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); lookup(id, email); }}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Input label="Request ID" value={id} onChange={(e) => setId(e.target.value)} className="flex-1" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
          <Button type="submit" loading={loading}>{loading ? 'Checking...' : 'Check Status'}</Button>
        </form>

        {result === null && (
          <p className="mt-6 text-body-sm text-danger">We couldn&apos;t find a request matching that ID and email.</p>
        )}

        {result && (
          <div className="mt-8 border-t border-border pt-6">
            <div className="mb-6 flex items-center gap-2">
              {result.serviceType === 'wedding' ? <Heart className="h-5 w-5 text-danger" /> : <Droplets className="h-5 w-5 text-info" />}
              <span className="text-title-sm capitalize text-foreground">{result.serviceType} Service Request</span>
            </div>
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        i <= stepIndex ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-subtle'
                      )}
                    >
                      {i < stepIndex ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <span className="mt-2 max-w-20 text-caption text-foreground-muted">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('mx-2 h-0.5 flex-1', i < stepIndex ? 'bg-accent' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
            {result.preferredDate && (
              <p className="mt-6 text-body-sm text-foreground-muted">Preferred date: {new Date(result.preferredDate).toLocaleDateString()}</p>
            )}
            <p className="mt-1 text-caption text-foreground-subtle">
              Last updated {result.updatedAt ? new Date(result.updatedAt).toLocaleString() : '—'}
            </p>
          </div>
        )}
      </Card>
    </Container>
  );
}

export default function ServiceRequestStatusPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <StatusForm />
    </Suspense>
  );
}
