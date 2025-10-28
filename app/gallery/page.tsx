'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, Eye, Heart, X, ChevronLeft, ChevronRight, Users, Camera } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';

interface EventGallery {
  _id: string;
  title: string;
  description: any;
  shortDescription?: string;
  galleryDescription?: string;
  startDate: string;
  endDate?: string;
  location: string;
  address?: string;
  category: string;
  image?: {
    asset: {
      url: string;
    };
  };
  photos: {
    _id: string;
    title: string;
    description?: string;
    image: {
      asset: {
        url: string;
      };
    };
    photographer?: string;
    dateTaken: string;
  }[];
}

export default function GalleryPage() {
  const [events, setEvents] = useState<EventGallery[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventGallery | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventGalleries();
  }, []);

  const fetchEventGalleries = async () => {
    setLoading(true);
    try {
      // First, check all events
      const allEvents = await sanityFetch(`*[_type == "event"] {
        _id, title, isPublic, showInGallery
      }`);
      console.log('All events:', allEvents);
      
      // Then check gallery images
      const allImages = await sanityFetch(`*[_type == "galleryImage"] {
        _id, title, isPublic, event
      }`);
      console.log('All gallery images:', allImages);
      
      // Simplified query without showInGallery filter
      const eventsData = await sanityFetch(`*[_type == "event" && isPublic == true] {
        _id, title, description, shortDescription, galleryDescription, startDate, endDate, location, address, category,
        image { asset-> { url } },
        "photos": *[_type == "galleryImage" && references(^._id) && isPublic == true] {
          _id, title, description,
          image { asset-> { url } },
          photographer, dateTaken
        }
      } | order(startDate desc)`);
      
      if (eventsData) {
        console.log('Fetched events:', eventsData);
        // Only include events that have photos
        const eventsWithPhotos = eventsData.filter((event: EventGallery) => event.photos && event.photos.length > 0);
        console.log('Events with photos:', eventsWithPhotos);
        setEvents(eventsWithPhotos);
      }
    } catch (error) {
      console.error('Error fetching event galleries:', error);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
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
  
  console.log('Current events state:', events);
  console.log('Loading state:', loading);

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
              {selectedEvent.image?.asset?.url && (
                <div className="md:w-1/3">
                  <img
                    src={selectedEvent.image.asset.url}
                    alt={selectedEvent.title}
                    className="w-full aspect-video object-cover rounded-lg"
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
                key={photo._id}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={photo.image.asset.url}
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
                    src={selectedEvent.photos[selectedImageIndex].image.asset.url}
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
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Gallery</h1>
          <p className="text-gray-600 dark:text-gray-300">Browse photos from our church events and activities</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No event galleries available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back soon for photos from our upcoming events.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Debug: Check browser console for data
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                  {event.image?.asset?.url ? (
                    <Image
                      src={event.image.asset.url}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : event.photos[0] ? (
                    <Image
                      src={event.photos[0].image.asset.url}
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
    </div>
  );
}