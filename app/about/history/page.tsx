'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, Users, Building, Award, Heart } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';

interface TimelineEvent {
  _id: string;
  year: number;
  title: string;
  description: string;
  image?: {
    asset: {
      url: string;
    };
  };
  category: string;
  featured: boolean;
}

export default function HistoryPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    setLoading(true);
    try {
      const events = await sanityFetch(`*[_type == "historyTimeline"] {
        _id, year, title, description, category, featured,
        image { asset-> { url } }
      } | order(year asc)`);
      
      if (events) {
        setTimelineEvents(events);
      }
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'foundation': return Building;
      case 'growth': return Users;
      case 'ministry': return Heart;
      case 'building': return Building;
      case 'leadership': return Award;
      case 'community': return Users;
      case 'milestone': return Award;
      default: return Clock;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundation': return 'from-amber-500 to-orange-600';
      case 'growth': return 'from-green-500 to-emerald-600';
      case 'ministry': return 'from-purple-500 to-violet-600';
      case 'building': return 'from-blue-500 to-cyan-600';
      case 'leadership': return 'from-red-500 to-pink-600';
      case 'community': return 'from-indigo-500 to-purple-600';
      case 'milestone': return 'from-yellow-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading church history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Clock className="w-16 h-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Our History
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              A legacy of faith and service to our community
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {timelineEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center"
          >
            <Clock className="w-16 h-16 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              No timeline events available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Add timeline events in Sanity CMS to display church history.
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500"></div>
            
            {/* Timeline Events */}
            <div className="space-y-12">
              {timelineEvents.map((event, index) => {
                const IconComponent = getCategoryIcon(event.category);
                const colorClass = getCategoryColor(event.category);
                
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="relative flex items-start"
                  >
                    {/* Timeline Node */}
                    <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                      {event.featured && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Event Content */}
                    <div className="ml-8 flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Text Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`inline-block px-3 py-1 bg-gradient-to-r ${colorClass} text-white text-sm font-bold rounded-full`}>
                                {event.year}
                              </span>
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full capitalize">
                                {event.category}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                          
                          {/* Image */}
                          {event.image?.asset?.url && (
                            <div className="lg:w-1/3">
                              <div className="aspect-video rounded-lg overflow-hidden">
                                <Image
                                  src={event.image.asset.url}
                                  alt={event.title}
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}