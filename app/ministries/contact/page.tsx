'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getMinistries } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';

interface Ministry {
  id: string;
  title: string;
}

function ContactMinistryLeaderPageInner() {
  const searchParams = useSearchParams();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingMinistries, setLoadingMinistries] = useState(true);

  const [formData, setFormData] = useState({ ministry: '', firstName: '', lastName: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchMinistries() {
      try {
        const ministriesData = await getMinistries();
        const list = ministriesData.map((m) => ({ id: m.id, title: m.title }));
        setMinistries(list);
        const requestedId = searchParams.get('ministry');
        const preselected = requestedId && list.some((m) => m.id === requestedId) ? requestedId : list[0]?.id;
        if (preselected) setFormData((prev) => ({ ...prev, ministry: prev.ministry || preselected }));
      } catch (error) {
        console.error('Error fetching ministries:', error);
      } finally {
        setLoadingMinistries(false);
      }
    }
    fetchMinistries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const ministryTitle = ministries.find((m) => m.id === formData.ministry)?.title || formData.ministry;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          message: formData.message,
          department: 'ministry-contact',
          ministry: ministryTitle,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setFormData((prev) => ({ ...prev, firstName: '', lastName: '', email: '', message: '' }));
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error contacting ministry leader:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="sm" className="py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
        <h1 className="text-display-sm text-foreground">Contact a Ministry Leader</h1>
        <p className="mt-3 text-body-lg text-foreground-muted">We&apos;re here to help you get connected. Select a ministry and send your message.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-10">
        <Card variant="raised" padding="lg">
          {submitStatus === 'success' ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-title-lg text-foreground">Message Sent!</h2>
              <p className="mt-2 text-body-md text-foreground-muted">Thank you for reaching out — a ministry leader will be in touch soon.</p>
              <Button className="mt-6" onClick={() => setSubmitStatus('idle')}>Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Ministry"
                required
                disabled={loadingMinistries}
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                options={
                  loadingMinistries
                    ? [{ value: '', label: 'Loading ministries...' }]
                    : ministries.length === 0
                      ? [{ value: '', label: 'No ministries available' }]
                      : ministries.map((m) => ({ value: m.id, label: m.title }))
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Textarea label="Message" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />

              {submitStatus === 'error' && (
                <p className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">
                  Something went wrong sending your message. Please try again.
                </p>
              )}

              <Button type="submit" fullWidth loading={submitting}>{submitting ? 'Sending...' : 'Send Message'}</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </Container>
  );
}

export default function ContactMinistryLeaderPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <ContactMinistryLeaderPageInner />
    </Suspense>
  );
}
