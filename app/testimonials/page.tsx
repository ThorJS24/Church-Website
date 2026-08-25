'use client';

import { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Quote, Send, Search } from 'lucide-react';
import { getTestimonials, Testimonial } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { LoadingState } from '@/components/ui/states';
import { cn } from '@/lib/utils';

const FEATURED_ROTATE_MS = 6000;

function displayName(t: Testimonial): string {
  if (t.displayPreference === 'anonymous') return 'Anonymous';
  if (t.displayPreference === 'first') return t.authorName.split(' ')[0] || t.authorName;
  return t.authorName;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: '', content: '', category: '', displayPreference: 'full' as 'full' | 'first' | 'anonymous' });
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getTestimonials().then(setTestimonials).finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => testimonials.filter((t) => t.featured), [testimonials]);

  useEffect(() => {
    if (featured.length < 2) return;
    const interval = setInterval(() => setFeaturedIndex((i) => (i + 1) % featured.length), FEATURED_ROTATE_MS);
    return () => clearInterval(interval);
  }, [featured.length]);

  const categories = useMemo(() => Array.from(new Set(testimonials.map((t) => t.category).filter((c): c is string => Boolean(c)))), [testimonials]);

  const filteredTestimonials = testimonials
    .filter((t) => activeCategory === 'all' || t.category === activeCategory)
    .filter((t) => !searchTerm || `${t.content} ${t.authorName}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitStatus('error');
      setErrorMessage('Please confirm you consent to sharing this testimony publicly.');
      return;
    }
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consentGiven }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setForm({ authorName: '', content: '', category: '', displayPreference: 'full' });
        setConsentGiven(false);
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

      {featured.length > 0 && (
        <Section spacing="md" className="bg-surface">
          <Container size="md">
            <p className="mb-4 text-center text-label uppercase tracking-wide text-foreground-subtle">Featured Story</p>
            <div className="relative min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featured[featuredIndex]?.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card variant="raised" padding="lg" className="text-center">
                    <Quote className="mx-auto mb-4 h-8 w-8 text-accent/60" />
                    <p className="text-title-md italic leading-relaxed text-foreground">&ldquo;{featured[featuredIndex]?.content}&rdquo;</p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <Avatar src={featured[featuredIndex]?.imageUrl} name={displayName(featured[featuredIndex])} size="sm" />
                      <p className="text-title-sm text-foreground">{displayName(featured[featuredIndex])}</p>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
              {featured.length > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  {featured.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => setFeaturedIndex(i)}
                      aria-label={`Show featured story ${i + 1}`}
                      className={cn('h-2 w-2 rounded-full transition-colors', i === featuredIndex ? 'bg-accent' : 'bg-surface-active hover:bg-surface-hover')}
                    />
                  ))}
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

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
                <Input label="Category (optional)" placeholder="e.g. Healing, Salvation, Family" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Select
                  label="How should your name appear?"
                  value={form.displayPreference}
                  onChange={(e) => setForm({ ...form, displayPreference: e.target.value as 'full' | 'first' | 'anonymous' })}
                  options={[
                    { value: 'full', label: 'Full name' },
                    { value: 'first', label: 'First name only' },
                    { value: 'anonymous', label: 'Anonymous' },
                  ]}
                />
                <label className="flex items-start gap-2 text-body-sm text-foreground-muted">
                  <input
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-accent"
                  />
                  I consent to my testimony being shared publicly on this website.
                </label>
                {submitStatus === 'error' && <p className="text-body-sm text-danger">{errorMessage}</p>}
                <Button type="submit" fullWidth loading={submitting} disabled={!consentGiven}>{submitting ? 'Submitting...' : 'Submit Testimony'}</Button>
                <p className="text-center text-caption text-foreground-subtle">Submissions are reviewed before appearing publicly.</p>
              </form>
            </Card>
          )}

          {testimonials.length > 0 && (
            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Input placeholder="Search testimonials..." aria-label="Search testimonials" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={cn('rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors', activeCategory === 'all' ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover')}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn('rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors', activeCategory === category ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover')}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {testimonials.length === 0 ? (
            <p className="text-center text-body-md text-foreground-muted">No testimonials yet — be the first to share.</p>
          ) : filteredTestimonials.length === 0 ? (
            <p className="text-center text-body-md text-foreground-muted">No testimonials match your search.</p>
          ) : (
            /* A quote wall — varying card heights in flowing columns —
               reads as social proof accumulating over time, not a matched
               product grid. */
            <div className="columns-1 gap-6 sm:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">
              {filteredTestimonials.map((t) => (
                <Card key={t.id}>
                  {t.category && <p className="mb-2 text-label uppercase tracking-wide text-accent">{t.category}</p>}
                  <Quote className="mb-3 h-6 w-6 text-accent/60" />
                  <p className="mb-4 text-body-md italic text-foreground-muted">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar src={t.displayPreference === 'anonymous' ? undefined : t.imageUrl} name={displayName(t)} size="sm" />
                    <p className="text-title-sm text-foreground">{displayName(t)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
