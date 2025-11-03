'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Tag, DollarSign, Star } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';
import EventModal from '@/components/EventModal';
import InteractiveCalendar from '@/components/InteractiveCalendar';

const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (url: string): string => {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/images/default-video.jpg';
};

interface Event {
  _id: string;
  title: string;
  subtitle?: string;
  description: any;
  shortDescription?: string;
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
  organizer?: {
    name: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  maxAttendees?: number;
  cost: number;
  tags?: string[];
  featured: boolean;
  recurring: boolean;
  recurrencePattern?: string;
  isPublic: boolean;
  youtubeUrl?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching events from Sanity...');
      const [eventsData, servicesData] = await Promise.all([
        sanityFetch(`*[_type == "event"] {
          _id,
          title,
          subtitle,
          description,
          shortDescription,
          startDate,
          endDate,
          location,
          address,
          category,
          image {
            asset-> {
              url
            }
          },
          organizer-> {
            name
          },
          contactEmail,
          contactPhone,
          registrationRequired,
          registrationUrl,
          maxAttendees,
          cost,
          tags,
          featured,
          recurring,
          recurrencePattern,
          isPublic
        }`),
        sanityFetch(`*[_type == "service"] {
          _id,
          title,
          time,
          location,
          description
        }`)
      ]);
      
      console.log('Events from Sanity:', eventsData);
      let allEvents = eventsData || [];
      if (servicesData) {
        setServices(servicesData);
        // Convert services to recurring events
        const serviceEvents: Event[] = [];
        servicesData.forEach(service => {
          const serviceDates = getServiceDates(service.time);
          serviceDates.forEach((date, index) => {
            serviceEvents.push({
              _id: `service-${service._id}-${index}`,
              title: service.title,
              description: service.description,
              shortDescription: service.description,
              startDate: date,
              location: service.location,
              category: 'regular-service',
              recurring: true,
              featured: false,
              isPublic: true,
              cost: 0,
              registrationRequired: false
            });
          });
        });
        allEvents = [...allEvents, ...serviceEvents];
      }
      
      console.log('Final events array:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceDates = (time: string, count = 8) => {
    const dates = [];
    const now = new Date();
    
    if (!time || !time.includes(':')) {
      console.error('Invalid time format:', time);
      return [];
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time values:', time);
      return [];
    }
    
    // Find next Sunday
    let nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    if (nextSunday.getDay() === 0 && nextSunday < now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    
    // Generate multiple Sunday dates
    for (let i = 0; i < count; i++) {
      const serviceDate = new Date(nextSunday);
      serviceDate.setDate(nextSunday.getDate() + (i * 7));
      serviceDate.setHours(hours, minutes, 0, 0);
      
      if (!isNaN(serviceDate.getTime())) {
        dates.push(serviceDate.toISOString());
      }
    }
    
    return dates;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.shortDescription && event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = selectedFilters.includes('all') || 
      selectedFilters.some(filter => event.category === filter);
    
    return matchesSearch && matchesFilters;
  });

  const categories = [
    { id: 'all', label: 'All Events', color: 'bg-gray-500' },
    { id: 'regular-service', label: 'Regular Services', color: 'bg-blue-500' },
    { id: 'special', label: 'Special Events', color: 'bg-purple-500' },
    { id: 'ministry', label: 'Ministry Events', color: 'bg-green-500' },
    { id: 'community', label: 'Community', color: 'bg-orange-500' },
    { id: 'youth', label: 'Youth Events', color: 'bg-pink-500' },
    { id: 'worship', label: 'Worship Events', color: 'bg-indigo-500' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  const handleFilterChange = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedFilters(['all']);
    } else {
      const newFilters = selectedFilters.includes('all') 
        ? [categoryId]
        : selectedFilters.includes(categoryId)
          ? selectedFilters.filter(f => f !== categoryId)
          : [...selectedFilters.filter(f => f !== 'all'), categoryId];
      
      setSelectedFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Join us for worship, fellowship, and community events</p>
        </motion.div>

        {/* Interactive Calendar */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Event Calendar</h2>
          <InteractiveCalendar />
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* Filter Checkboxes */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Category:</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <label key={category.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(category.id)}
                    onChange={() => handleFilterChange(category.id)}
                    className="sr-only"
                  />
                  <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFilters.includes(category.id)
                      ? `${category.color} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${category.color}`}></div>
                    {category.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back soon for new events and activities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gray-200">
                  <Image 
                    src={event.image?.asset?.url || getYouTubeThumbnail(event.youtubeUrl || '') || '/images/default-event.jpg'} 
                    alt={event.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-event.jpg';
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`${getCategoryColor(event.category)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                        {event.category === 'regular-service' ? 'Weekly' : new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {event.featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {event.cost !== undefined && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {event.cost === 0 ? 'Free' : `$${event.cost}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                  {event.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{event.subtitle}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="mr-2 w-4 h-4" />
                      {new Date(event.startDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                      {event.endDate && (
                        <span className="ml-1">- {new Date(event.endDate).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 w-4 h-4" />
                      {event.location}
                    </div>
                    {event.category && (
                      <div className="flex items-center">
                        <Tag className="mr-2 w-4 h-4" />
                        <span className={`px-2 py-1 ${getCategoryColor(event.category)} text-white rounded text-xs`}>
                          {categories.find(c => c.id === event.category)?.label || event.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {event.shortDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {event.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium"
                    >
                      Learn More
                    </button>
                    {event.registrationRequired && event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Register
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <EventModal 
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </div>
  );
}