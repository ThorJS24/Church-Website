'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarEvents, CalendarEvent, formatEventDate } from '@/lib/google-calendar';

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
      const calendarEvents = await getCalendarEvents(20);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
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
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const hasEvents = dayEvents.length > 0;
            
            return (
              <motion.div
                key={index}
                className={`
                  h-12 flex items-center justify-center text-sm cursor-pointer rounded
                  ${day ? 'hover:bg-blue-50' : ''}
                  ${hasEvents ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'}
                `}
                whileHover={day ? { scale: 1.05 } : {}}
                onClick={() => {
                  if (day && hasEvents) {
                    setSelectedEvent(dayEvents[0]);
                  }
                }}
              >
                {day && (
                  <div className="relative">
                    {day}
                    {hasEvents && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="border-t p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Upcoming Events
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events.slice(0, 5).map((event) => (
            <motion.div
              key={event.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedEvent(event)}
            >
              <h4 className="font-medium text-gray-900 text-sm">{event.summary}</h4>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                {formatEventDate(event)}
              </div>
              {event.location && (
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.location}
                </div>
              )}
            </motion.div>
          ))}
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
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.summary}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatEventDate(selectedEvent)}
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedEvent.location}
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="text-gray-700">
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <a
                href={selectedEvent.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                View in Google Calendar
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}