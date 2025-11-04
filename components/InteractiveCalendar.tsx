'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ExternalLink, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface CalendarEvent {
  _id: string;
  title: string;
  subtitle?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category?: string;
  featured?: boolean;
  cost?: number;
  shortDescription?: string;
  organizer?: { name: string };
  registrationUrl?: string;
}

export default function InteractiveCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);



  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [eventsData, servicesData] = await Promise.all([
        sanityFetch(`*[_type == "event"] {
          _id,
          title,
          subtitle,
          startDate,
          endDate,
          location,
          category,
          featured,
          cost,
          shortDescription,
          organizer->{ name },
          registrationUrl
        } | order(_createdAt desc)`),
        sanityFetch(`*[_type == "service"] {
          _id,
          title,
          time,
          location
        }`)
      ]);
      
      let allEvents = (eventsData || []).filter((event: any) => event.startDate);
      
      if (servicesData) {
        const serviceEvents: CalendarEvent[] = [];
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get all Sundays in current month + next 2 months for recurring services
        for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
          const targetMonth = currentMonth + monthOffset;
          const targetYear = targetMonth > 11 ? currentYear + 1 : currentYear;
          const adjustedMonth = targetMonth > 11 ? targetMonth - 12 : targetMonth;
          
          for (let day = 1; day <= new Date(targetYear, adjustedMonth + 1, 0).getDate(); day++) {
            const date = new Date(targetYear, adjustedMonth, day);
            if (date.getDay() === 0) {
              servicesData.forEach((service: any) => {
                if (!service.time || !service.time.includes(':')) return;
                
                const [hours, minutes] = service.time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) return;
                
                const serviceDate = new Date(date);
                serviceDate.setHours(hours, minutes, 0, 0);
                
                if (!isNaN(serviceDate.getTime())) {
                  serviceEvents.push({
                    _id: `service-${service._id}-${date.toISOString().split('T')[0]}`,
                    title: service.title,
                    startDate: serviceDate.toISOString(),
                    location: service.location,
                    category: 'regular-service',
                    featured: false
                  });
                }
              });
            }
          }
        }
        allEvents = [...allEvents, ...serviceEvents];
      }
      
      console.log('Calendar events with dates:', allEvents.slice(0, 3).map((e: any) => ({ title: e.title, startDate: e.startDate })));
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    if (!day) return [];
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      if (isNaN(eventDate.getTime())) return false;
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigateMonth('prev')}
            className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex items-center gap-4">
            <motion.h2 
              className="text-2xl font-bold bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentDate.getMonth()}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </motion.h2>
            <input
              type="month"
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg border border-white/30 text-sm"
            />
          </div>
          <motion.button
            onClick={() => navigateMonth('next')}
            className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold py-3 bg-white/10 rounded-lg backdrop-blur-sm">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentDate).map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const hasEvents = dayEvents.length > 0;
            const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const minHeight = Math.max(112, dayEvents.length * 24 + 60);
            
            return (
              <motion.div
                key={index}
                className={`
                  rounded-xl flex flex-col cursor-pointer transition-all duration-300 shadow-sm
                  ${day ? 'hover:shadow-lg hover:scale-105' : 'bg-transparent'}
                  ${isToday ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' :
                    hasEvents ? 'bg-white border-2 border-blue-200' : 
                    day ? 'bg-white hover:bg-blue-50 border border-gray-200' : ''}
                `}
                style={{ minHeight: `${minHeight}px` }}
                whileHover={day ? { y: -2 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                {day && (
                  <div className="w-full h-full p-2 flex flex-col">
                    <div className={`text-sm font-bold mb-2 text-center ${
                      isToday ? 'text-white' : hasEvents ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day}
                      {isToday && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1"></div>}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      {dayEvents.map((event) => (
                        <motion.button
                          key={event._id}
                          className={`text-xs px-2 py-1 rounded text-white shadow-sm w-full text-left ${
                            event.category === 'regular-service' ? 'bg-blue-500' :
                            event.category === 'special' ? 'bg-purple-500' :
                            event.category === 'ministry' ? 'bg-green-500' :
                            event.category === 'community' ? 'bg-orange-500' :
                            event.category === 'youth' ? 'bg-pink-500' :
                            event.category === 'worship' ? 'bg-indigo-500' :
                            'bg-gray-500'
                          }`}
                          title={`${new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${event.title}`}
                          whileHover={{ scale: 1.02 }}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>



      {/* Event Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(selectedEvent as any).allEvents ? (
              // Multiple events view
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(selectedEvent as any).allEvents.map((event: CalendarEvent) => (
                    <motion.div
                      key={event._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {event.endDate && (
                              <span> - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${
                          event.category === 'regular-service' ? 'bg-blue-500' :
                          event.category === 'special' ? 'bg-purple-500' :
                          event.category === 'ministry' ? 'bg-green-500' :
                          event.category === 'community' ? 'bg-orange-500' :
                          event.category === 'youth' ? 'bg-pink-500' :
                          event.category === 'worship' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        }`}>
                          {event.category?.replace('-', ' ') || 'Event'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Single event view
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                    {selectedEvent.subtitle && (
                      <p className="text-gray-600 text-lg">{selectedEvent.subtitle}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-4"
                  >
                    ×
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium">
                        {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-blue-600" />
                      <span>
                        {new Date(selectedEvent.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {selectedEvent.endDate && (
                          <span> - {new Date(selectedEvent.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                      </span>
                    </div>
                    
                    {selectedEvent.location && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    
                    {selectedEvent.category && (
                      <div className="flex items-center text-gray-700">
                        <Tag className="w-5 h-5 mr-3 text-blue-600" />
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${
                          selectedEvent.category === 'regular-service' ? 'bg-blue-500' :
                          selectedEvent.category === 'special' ? 'bg-purple-500' :
                          selectedEvent.category === 'ministry' ? 'bg-green-500' :
                          selectedEvent.category === 'community' ? 'bg-orange-500' :
                          selectedEvent.category === 'youth' ? 'bg-pink-500' :
                          selectedEvent.category === 'worship' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        }`}>
                          {selectedEvent.category.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {selectedEvent.cost !== undefined && (
                      <div className="flex items-center text-gray-700">
                        <span className="w-5 h-5 mr-3 text-blue-600 text-lg">💰</span>
                        <span className="font-medium">
                          {selectedEvent.cost === 0 ? 'Free Event' : `$${selectedEvent.cost}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedEvent.shortDescription && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">About This Event</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.shortDescription}</p>
                  </div>
                )}
                
                {selectedEvent.organizer?.name && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Organized By</h4>
                    <p className="text-gray-700">{selectedEvent.organizer.name}</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {selectedEvent.registrationUrl && (
                    <a
                      href={selectedEvent.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Register Now
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}