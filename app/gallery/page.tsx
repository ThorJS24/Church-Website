'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, Eye, X, ChevronLeft, ChevronRight, Camera, Upload, Search } from 'lucide-react';
import { getEventGalleries, EventGallery, GalleryPhoto } from '@/lib/content';
import Image from 'next/image';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMounted } from '@/hooks/useMounted';
import { createPortal } from 'react-dom';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

const MAX_SUBMIT_BYTES = 4 * 1024 * 1024; // matches app/api/gallery/submit/route.ts
const ALLOWED_SUBMIT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PAGE_SIZE = 12;

function renderDescription(description: any): string {
  if (typeof description === 'string') return description;
  if (Array.isArray(description)) {
    return description.map((block: any) => (block._type === 'block' ? block.children?.map((c: any) => c.text).join('') || '' : '')).join('\n');
  }
  return '';
}

function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useFocusTrap(true, onClose, modalRef);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNavigate]);

  if (!mounted) return null;
  const photo = photos[index];

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        <IconButton label="Previous photo" size="lg" onClick={() => onNavigate('prev')} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20">
          <ChevronLeft />
        </IconButton>
        <IconButton label="Next photo" size="lg" onClick={() => onNavigate('next')} className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20">
          <ChevronRight />
        </IconButton>
        <IconButton label="Close viewer" onClick={onClose} className="absolute right-4 top-4 z-10 bg-white/10 text-white hover:bg-white/20">
          <X />
        </IconButton>

        <div className="relative flex h-full w-full items-center justify-center p-4">
          <Image src={photo.imageUrl} alt={photo.title} fill className="object-contain" sizes="100vw" priority />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
          <h3 className="text-title-md">{photo.title}</h3>
          {photo.description && <p className="mt-1 text-body-sm opacity-80">{photo.description}</p>}
          <div className="mt-2 flex items-center justify-between text-body-sm opacity-80">
            <span className="flex items-center gap-3">
              <span>{new Date(photo.dateTaken).toLocaleDateString()}</span>
              {photo.photographer && <span>📸 {photo.photographer}</span>}
            </span>
            <span>{index + 1} of {photos.length}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function GalleryPage() {
  const [events, setEvents] = useState<EventGallery[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventGallery | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', submitterName: '' });
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getEventGalleries()
      .then(setEvents)
      .catch((error) => console.error('Error fetching event galleries:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedEvent]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !selectedEvent) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, selectedEvent.photos.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [selectedEvent]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(events.map((e) => e.category).filter(Boolean)))], [events]);

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = !searchTerm || event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileSelect = (file: File | null) => {
    setSubmitError('');
    if (!file) return setSubmitFile(null);
    if (!ALLOWED_SUBMIT_TYPES.includes(file.type)) {
      setSubmitError('Please choose a JPEG, PNG, WebP, or GIF image.');
      return setSubmitFile(null);
    }
    if (file.size > MAX_SUBMIT_BYTES) {
      setSubmitError('That image is larger than 4MB. Please choose a smaller file.');
      return setSubmitFile(null);
    }
    setSubmitFile(file);
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitFile) {
      setSubmitError('Please choose a photo to submit.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const body = new FormData();
      body.append('file', submitFile);
      body.append('title', submitForm.title);
      body.append('submitterName', submitForm.submitterName);
      const response = await fetch('/api/gallery/submit', { method: 'POST', body });
      const data = await response.json();
      if (data.success) {
        setShowSubmitModal(false);
        setSubmitForm({ title: '', submitterName: '' });
        setSubmitFile(null);
        toast({ title: 'Thanks!', description: 'Your photo will appear once a moderator reviews it.', variant: 'success' });
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (selectedImageIndex === null || !selectedEvent) return;
      const total = selectedEvent.photos.length;
      setSelectedImageIndex(direction === 'prev' ? (selectedImageIndex > 0 ? selectedImageIndex - 1 : total - 1) : selectedImageIndex < total - 1 ? selectedImageIndex + 1 : 0);
    },
    [selectedImageIndex, selectedEvent]
  );

  if (loading) return <LoadingState label="Loading event galleries..." />;

  if (selectedEvent) {
    const visiblePhotos = selectedEvent.photos.slice(0, visibleCount);
    return (
      <div>
        <div className="border-b border-border bg-surface">
          <Section spacing="sm">
            <button onClick={() => setSelectedEvent(null)} className="mb-4 flex items-center gap-2 text-body-sm font-medium text-accent hover:text-accent-hover">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </button>
            <div className="flex flex-col gap-6 md:flex-row">
              {selectedEvent.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-active md:w-1/3">
                  <Image src={selectedEvent.imageUrl} alt={selectedEvent.title} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" priority />
                </div>
              )}
              <div className="md:w-2/3">
                <h1 className="text-headline-md text-foreground">{selectedEvent.title}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-body-sm text-foreground-muted">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedEvent.location}</span>
                  <span className="flex items-center gap-2"><Camera className="h-4 w-4" /> {selectedEvent.photos.length} photos</span>
                </div>
                <p className="mt-4 text-body-sm leading-relaxed text-foreground-muted">
                  {selectedEvent.galleryDescription || selectedEvent.shortDescription || renderDescription(selectedEvent.description)}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <Section spacing="lg">
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {visiblePhotos.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                className="group relative mb-3 block w-full overflow-hidden rounded-lg bg-surface-active"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="w-full object-cover transition-transform duration-slow group-hover:scale-105"
                  style={{ height: 'auto' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-base group-hover:bg-black/30">
                  <Eye className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.button>
            ))}
          </div>
          {visibleCount < selectedEvent.photos.length && <div ref={sentinelRef} className="h-1" />}
        </Section>

        {selectedImageIndex !== null && (
          <PhotoLightbox photos={selectedEvent.photos} index={selectedImageIndex} onClose={() => setSelectedImageIndex(null)} onNavigate={navigateImage} />
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHero
        icon={<Camera />}
        eyebrow="Photo Gallery"
        title="Event Gallery"
        description="Browse photos from our church events and activities"
        actions={<Button leftIcon={<Upload className="h-4 w-4" />} onClick={() => setShowSubmitModal(true)}>Submit a Photo</Button>}
      />

      {events.length > 0 && (
        <Section spacing="sm" className="bg-surface">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Input placeholder="Search albums..." aria-label="Search albums" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
            {categories.length > 2 && (
              <Select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories.map((c) => ({ value: c, label: c === 'all' ? 'All Categories' : c }))}
                className="w-auto capitalize"
              />
            )}
          </div>
        </Section>
      )}

      <Section spacing="lg">
        {filteredEvents.length === 0 ? (
          <EmptyState icon={Camera} title="No event galleries available" description="Check back soon for photos from our upcoming events." />
        ) : (
          <Grid cols={3} gap={6}>
            {filteredEvents.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}>
                <Card padding="none" className="h-full cursor-pointer overflow-hidden" onClick={() => setSelectedEvent(event)}>
                  <div className="relative aspect-video bg-surface-active">
                    {(event.imageUrl || event.photos[0]) ? (
                      <Image src={event.imageUrl || event.photos[0].imageUrl} alt={event.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-10 w-10 text-foreground-subtle" />
                      </div>
                    )}
                    <Badge variant="neutral" className="absolute top-3 right-3 bg-background/90"><Camera className="h-3 w-3" /> {event.photos.length}</Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="text-title-md text-foreground">{event.title}</h3>
                    <div className="mt-2 space-y-1 text-body-sm text-foreground-muted">
                      <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(event.startDate).toLocaleDateString()}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>
                    </div>
                    {event.shortDescription && <p className="mt-3 line-clamp-2 text-body-sm text-foreground-muted">{event.shortDescription}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="accent">{event.category}</Badge>
                      <span className="text-body-sm font-medium text-accent">View Photos →</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </Section>

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit a Photo" description="Photos are reviewed by a moderator before they appear in the gallery.">
        <form onSubmit={handleSubmitPhoto} className="space-y-5">
          <div>
            <label className="mb-2 block text-label text-foreground">Photo *</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              required
              className="w-full cursor-pointer text-body-sm text-foreground-muted file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-accent-foreground hover:file:bg-accent-hover"
            />
            <p className="mt-1 text-caption text-foreground-subtle">JPEG, PNG, WebP, or GIF — max 4MB</p>
          </div>
          <Input label="Title" placeholder="What's this photo of?" value={submitForm.title} onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })} />
          <Input label="Your Name" placeholder="Your name (optional)" value={submitForm.submitterName} onChange={(e) => setSubmitForm({ ...submitForm, submitterName: e.target.value })} />
          {submitError && <p className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">{submitError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={submitting}>{submitting ? 'Submitting...' : 'Submit Photo'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
