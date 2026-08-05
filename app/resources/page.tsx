'use client';

import { useEffect, useState, useMemo } from 'react';
import { Download, FileText, Search, Star, Bookmark, BookmarkCheck, Send, CheckCircle2 } from 'lucide-react';
import { getResources, Resource } from '@/lib/content';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/cn';

const BOOKMARKS_KEY = 'resource-bookmarks';

function loadBookmarks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

interface RatingSummary {
  average: number;
  count: number;
  myRating: number | null;
  reviews: { rating: number; review: string }[];
}

function RatingModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [myStars, setMyStars] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/resources/rate?resourceId=${resource.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data);
          if (data.myRating) setMyStars(data.myRating);
        }
      })
      .finally(() => setLoading(false));
  }, [resource.id]);

  const submitRating = async () => {
    if (!myStars) return;
    setSubmitting(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/resources/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ resourceId: resource.id, rating: myStars, review }),
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await fetch(`/api/resources/rate?resourceId=${resource.id}`).then((r) => r.json());
        if (refreshed.success) setSummary(refreshed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={resource.title} description="Ratings and reviews from members">
      {loading ? (
        <LoadingState label="Loading ratings..." />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn('h-5 w-5', n <= Math.round(summary?.average ?? 0) ? 'fill-warning text-warning' : 'text-foreground-subtle')} />
              ))}
            </div>
            <span className="text-body-sm text-foreground-muted">
              {summary?.count ? `${summary.average.toFixed(1)} (${summary.count} ${summary.count === 1 ? 'rating' : 'ratings'})` : 'No ratings yet'}
            </span>
          </div>

          {user ? (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-body-sm font-medium text-foreground">{summary?.myRating ? 'Update your rating' : 'Rate this resource'}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setMyStars(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`}>
                    <Star className={cn('h-6 w-6', n <= myStars ? 'fill-warning text-warning' : 'text-foreground-subtle hover:text-warning/60')} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Share a short review (optional)" rows={2} value={review} onChange={(e) => setReview(e.target.value)} />
              <Button size="sm" onClick={submitRating} loading={submitting} disabled={!myStars}>
                {submitting ? 'Saving...' : 'Submit Rating'}
              </Button>
            </div>
          ) : (
            <p className="rounded-lg bg-surface-active p-3 text-body-sm text-foreground-muted">Sign in to rate this resource.</p>
          )}

          {summary && summary.reviews.length > 0 && (
            <div>
              <p className="mb-2 text-body-sm font-medium text-foreground">Member Reviews</p>
              <ul className="space-y-3">
                {summary.reviews.map((r, i) => (
                  <li key={i} className="rounded-lg bg-surface-active p-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={cn('h-3.5 w-3.5', n <= r.rating ? 'fill-warning text-warning' : 'text-foreground-subtle')} />
                      ))}
                    </div>
                    <p className="mt-1 text-body-sm text-foreground-muted">{r.review}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [ratingResource, setRatingResource] = useState<Resource | null>(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    getResources().then(setResources).finally(() => setLoading(false));
    setBookmarks(loadBookmarks());
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const types = useMemo(() => Array.from(new Set(resources.map((r) => r.resourceType).filter((t): t is string => Boolean(t)))), [resources]);
  const ageGroups = useMemo(() => Array.from(new Set(resources.map((r) => r.ageGroup).filter((a): a is string => Boolean(a)))), [resources]);

  const filteredResources = resources
    .filter((r) => typeFilter === 'all' || r.resourceType === typeFilter)
    .filter((r) => ageFilter === 'all' || r.ageGroup === ageFilter)
    .filter((r) => !showBookmarkedOnly || bookmarks.has(r.id))
    .filter((r) => !searchTerm || `${r.title} ${r.description ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const byCategory = filteredResources.reduce<Record<string, Resource[]>>((acc, r) => {
    const cat = r.category || 'General';
    (acc[cat] ||= []).push(r);
    return acc;
  }, {});

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestForm, department: 'resource-request' }),
      });
      const data = await response.json();
      if (data.success) {
        setRequestStatus('success');
        setRequestForm({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setRequestStatus('error');
      }
    } catch {
      setRequestStatus('error');
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading resources..." />;

  return (
    <div>
      <PageHero
        icon={<FileText />}
        eyebrow="Downloads"
        title="Resources"
        description="Bible studies, devotionals, and downloads"
        actions={<Button leftIcon={<Send className="h-4 w-4" />} onClick={() => setShowRequestModal(true)}>Request a Resource</Button>}
      />

      {resources.length > 0 && (
        <Section spacing="sm" className="bg-surface">
          <Container size="sm">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Input placeholder="Search resources..." aria-label="Search resources" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
              {types.length > 0 && (
                <Select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: 'all', label: 'Any Type' }, ...types.map((t) => ({ value: t, label: t }))]} className="w-auto" />
              )}
              {ageGroups.length > 0 && (
                <Select aria-label="Filter by age group" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} options={[{ value: 'all', label: 'Any Age Group' }, ...ageGroups.map((a) => ({ value: a, label: a }))]} className="w-auto" />
              )}
              <button
                onClick={() => setShowBookmarkedOnly((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
                  showBookmarkedOnly ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-muted hover:bg-surface-hover'
                )}
              >
                <Bookmark className="h-4 w-4" /> My Library {bookmarks.size > 0 && `(${bookmarks.size})`}
              </button>
            </div>
          </Container>
        </Section>
      )}

      <Section spacing="lg">
        <Container size="sm">
          {resources.length === 0 ? (
            <EmptyState icon={FileText} title="No resources available yet" />
          ) : filteredResources.length === 0 ? (
            <p className="text-center text-body-md text-foreground-muted">
              {showBookmarkedOnly ? "You haven't bookmarked any resources yet." : 'No resources match your search.'}
            </p>
          ) : (
            Object.entries(byCategory).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h2 className="mb-4 text-title-lg text-foreground">{category}</h2>
                <div className="space-y-3">
                  {items.map((r) => (
                    <Card key={r.id} variant="flat" className="flex items-center gap-4">
                      <FileText className="h-8 w-8 shrink-0 text-accent" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-md font-medium text-foreground">{r.title}</p>
                        {r.description && <p className="truncate text-body-sm text-foreground-muted">{r.description}</p>}
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {r.resourceType && <span className="rounded-full bg-surface-active px-2 py-0.5 text-caption text-foreground-muted">{r.resourceType}</span>}
                          {r.ageGroup && <span className="rounded-full bg-surface-active px-2 py-0.5 text-caption text-foreground-muted">{r.ageGroup}</span>}
                        </div>
                      </div>
                      <IconButton label="Rate this resource" size="sm" variant="ghost" onClick={() => setRatingResource(r)}>
                        <Star className="h-4 w-4" />
                      </IconButton>
                      <IconButton label={bookmarks.has(r.id) ? 'Remove from My Library' : 'Save to My Library'} size="sm" variant="ghost" onClick={() => toggleBookmark(r.id)}>
                        {bookmarks.has(r.id) ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
                      </IconButton>
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                        <IconButton label={`Download ${r.title}`} size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </IconButton>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </Container>
      </Section>

      {ratingResource && <RatingModal resource={ratingResource} onClose={() => setRatingResource(null)} />}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request a Resource" description="Let us know what Bible study, devotional, or download you'd like to see added.">
        {requestStatus === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-body-md font-medium text-foreground">Request sent!</p>
            <p className="mt-1 text-body-sm text-foreground-muted">Thank you — we'll take a look.</p>
            <Button className="mt-4" variant="secondary" onClick={() => { setRequestStatus('idle'); setShowRequestModal(false); }}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="First Name" required value={requestForm.firstName} onChange={(e) => setRequestForm({ ...requestForm, firstName: e.target.value })} />
              <Input label="Last Name" required value={requestForm.lastName} onChange={(e) => setRequestForm({ ...requestForm, lastName: e.target.value })} />
            </div>
            <Input label="Email" type="email" required value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} />
            <Textarea label="What resource would you like to see?" required rows={4} value={requestForm.message} onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })} />
            {requestStatus === 'error' && <p className="text-body-sm text-danger">Something went wrong. Please try again.</p>}
            <Button type="submit" fullWidth loading={requestSubmitting}>{requestSubmitting ? 'Sending...' : 'Send Request'}</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
