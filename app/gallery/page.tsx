'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, Eye, Heart, X, ChevronLeft, ChevronRight, Users, Camera, Upload } from 'lucide-react';
import { getEventGalleries, EventGallery } from '@/lib/content';
import Image from 'next/image';
import DivineButton from '@/components/DivineButton';
import HeavenlyCard from '@/components/HeavenlyCard';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const MAX_SUBMIT_BYTES = 4 * 1024 * 1024; // matches app/api/gallery/submit/route.ts
const ALLOWED_SUBMIT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function GalleryPage() {
  const [events, setEvents] = useState<EventGallery[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventGallery | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', submitterName: '' });
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');
  const imageModalRef = useRef<HTMLDivElement>(null);
  const submitModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(selectedImageIndex !== null, () => setSelectedImageIndex(null), imageModalRef);
  useFocusTrap(showSubmitModal, () => setShowSubmitModal(false), submitModalRef);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    fetchEventGalleries();
  }, []);

  const fetchEventGalleries = async () => {
    setLoading(true);
    try {
      const eventsWithPhotos = await getEventGalleries();
      setEvents(eventsWithPhotos);
    } catch (error) {
      console.error('Error fetching event galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSubmitError('');
    if (!file) {
      setSubmitFile(null);
      return;
    }
    if (!ALLOWED_SUBMIT_TYPES.includes(file.type)) {
      setSubmitError('Please choose a JPEG, PNG, WebP, or GIF image.');
      setSubmitFile(null);
      return;
    }
    if (file.size > MAX_SUBMIT_BYTES) {
      setSubmitError('That image is larger than 4MB. Please choose a smaller file.');
      setSubmitFile(null);
      return;
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
        setSubmitStatus('success');
        setShowSubmitModal(false);
        setSubmitForm({ title: '', submitterName: '' });
        setSubmitFile(null);
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderDescription = (description: any) => {
    if (typeof description === 'string') return description;
    if (Array.isArray(description)) {
      return description.map((block: any) => {
        if (block._type === 'block') {
          return block.children?.map((child: any) => child.text).join('') || '';
        }
        return '';
      }).join('\n');
    }
    return '';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null || !selectedEvent) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : selectedEvent.photos.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < selectedEvent.photos.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event galleries...</p>
        </div>
      </div>
    );
  }
  
  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Event Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-4">
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              {selectedEvent.imageUrl && (
                <div className="md:w-1/3">
                  <Image
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    width={400}
                    height={225}
                    className="w-full aspect-video object-cover rounded-lg"
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}
              
              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedEvent.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                    {selectedEvent.endDate && (
                      <span>- {new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedEvent.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>{selectedEvent.photos.length} photos</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedEvent.galleryDescription || selectedEvent.shortDescription || renderDescription(selectedEvent.description)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedEvent.photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Image Viewer Modal */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              ref={imageModalRef}
              role="dialog"
              aria-modal="true"
              aria-label="Photo viewer"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Navigation */}
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {/* Image */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={selectedEvent.photos[selectedImageIndex].imageUrl}
                    alt={selectedEvent.photos[selectedImageIndex].title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                  <h3 className="text-lg font-bold mb-1">{selectedEvent.photos[selectedImageIndex].title}</h3>
                  {selectedEvent.photos[selectedImageIndex].description && (
                    <p className="text-sm opacity-80 mb-2">{selectedEvent.photos[selectedImageIndex].description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span>{new Date(selectedEvent.photos[selectedImageIndex].dateTaken).toLocaleDateString()}</span>
                      {selectedEvent.photos[selectedImageIndex].photographer && (
                        <span>📸 {selectedEvent.photos[selectedImageIndex].photographer}</span>
                      )}
                    </div>
                    <span className="text-sm">{selectedImageIndex + 1} of {selectedEvent.photos.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Gallery</h1>
            <p className="text-gray-600 dark:text-gray-300">Browse photos from our church events and activities</p>
          </div>
          <DivineButton onClick={() => setShowSubmitModal(true)} variant="primary" className="flex items-center justify-center gap-2 shrink-0">
            <Upload className="w-4 h-4" /> Submit a Photo
          </DivineButton>
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No event galleries available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check back soon for photos from our upcoming events.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : event.photos[0] ? (
                    <Image
                      src={event.photos[0].imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {event.photos.length}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                  
                  <div className="flex flex-col gap-2 mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  {event.shortDescription && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                      {event.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">View Photos →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit a Photo Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div ref={submitModalRef} role="dialog" aria-modal="true" aria-labelledby="submit-photo-title" tabIndex={-1} className="max-w-md w-full max-h-[90vh]">
          <HeavenlyCard glowIntensity="high" className="w-full max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 id="submit-photo-title" className="text-2xl font-bold text-gray-900 dark:text-white">Submit a Photo</h3>
                <motion.button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Photos are reviewed by a moderator before they appear in the gallery.
              </p>

              <form onSubmit={handleSubmitPhoto} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Photo *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    required
                    className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPEG, PNG, WebP, or GIF — max 4MB</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="What's this photo of?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={submitForm.submitterName}
                    onChange={(e) => setSubmitForm({ ...submitForm, submitterName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Your name (optional)"
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <DivineButton
                    onClick={() => setShowSubmitModal(false)}
                    variant="secondary"
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </DivineButton>
                  <DivineButton variant="primary" className="flex-1" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Photo'}
                  </DivineButton>
                </div>
              </form>
            </motion.div>
          </HeavenlyCard>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p>Thanks! Your photo will appear once a moderator reviews it.</p>
        </div>
      )}
    </div>
  );
}