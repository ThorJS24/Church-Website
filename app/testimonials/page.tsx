'use client';

import { useEffect, useState } from 'react';
import { Quote, Send } from 'lucide-react';
import { getTestimonials, Testimonial } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/States';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getTestimonials().then(setTestimonials).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setForm({ authorName: '', content: '' });
        setShowForm(false);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to submit testimony');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Failed to submit testimony. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading testimonials..." />;

  return (
    <div>
      <PageHero icon={<Quote />} eyebrow="Life Change" title="Testimonials" description="Stories of faith and God's work in the lives of our church family" />

      <Section spacing="lg">
        <Container size="md">
          {submitStatus === 'success' && (
            <div className="mb-8 rounded-lg border border-success/30 bg-success-subtle p-4 text-center text-body-sm text-success">
              Thank you — your testimony will appear here once reviewed.
            </div>
          )}

          <div className="mb-10 flex justify-center">
            <Button leftIcon={<Send className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
              Share Your Testimony
            </Button>
          </div>

          {showForm && (
            <Card variant="raised" padding="lg" className="mx-auto mb-12 max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Your Name" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
                <Textarea label="Your Testimony" required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                {submitStatus === 'error' && <p className="text-body-sm text-danger">{errorMessage}</p>}
                <Button type="submit" fullWidth loading={submitting}>{submitting ? 'Submitting...' : 'Submit Testimony'}</Button>
                <p className="text-center text-caption text-foreground-subtle">Submissions are reviewed before appearing publicly.</p>
              </form>
            </Card>
          )}

          {testimonials.length === 0 ? (
            <p className="text-center text-body-md text-foreground-muted">No testimonials yet — be the first to share.</p>
          ) : (
            <Grid cols={2} gap={6}>
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <Quote className="mb-3 h-6 w-6 text-accent/60" />
                  <p className="mb-4 text-body-md italic text-foreground-muted">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar src={t.imageUrl} name={t.authorName} size="sm" />
                    <p className="text-title-sm text-foreground">{t.authorName}</p>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </div>
  );
}
