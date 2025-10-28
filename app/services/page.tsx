'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, BookOpen, Clock, MapPin, Calendar, Video, Coffee, Baby, Users, Bell, Heart, Radio } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

const DynamicLiveStream = lazy(() => import('@/components/DynamicLiveStream'));

interface Service {
  _id: string;
  title: string;
  time: string;
  location: string;
  description: string;
}

interface ServicesPage {
  title: string;
  subtitle: string;
  whatToExpectSectionTitle: string;
  whatToExpect: Array<{
    title: string;
    description: string;
  }>;
  specialEventsSectionTitle: string;
  specialEvents: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  onlineServicesTitle: string;
  onlineServicesDescription: string;
  planYourVisitTitle: string;
  planYourVisitDescription: string;
  planYourVisit: Array<{
    title: string;
    description: string;
  }>;
}

const iconMap: { [key: string]: any } = {
  'Sunday Morning Worship': Sun,
  'Sunday Evening Service': Moon,
  'Wednesday Bible Study': BookOpen,
  'Warm Welcome': Coffee,
  'Come as You Are': Sun,
  'Uplifting Music': Video,
  'Practical Messages': BookOpen,
  'Kids Programs': Baby,
  'Fellowship Time': Coffee,
  'Address': MapPin,
  'Parking': MapPin,
  'Accessibility': Users,
  'Nursery': Baby,
};

export default function ServicesPage() {
  const [servicesPage, setServicesPage] = useState<ServicesPage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesPageData, servicesData, settingsData, livestreamData] = await Promise.all([
        sanityFetch(`*[_type == "servicesPage"][0] {
          title,
          subtitle,
          whatToExpectSectionTitle,
          whatToExpect,
          specialEventsSectionTitle,
          specialEvents,
          onlineServicesTitle,
          onlineServicesDescription,
          planYourVisitTitle,
          planYourVisitDescription,
          planYourVisit
        }`),
        sanityFetch(`*[_type == "service"] {
          _id,
          title,
          time,
          location,
          description
        }`),
        sanityFetch(`*[_type == "siteSettings"][0] {
          youtubeChannelUrl,
          googleMapsUrl,
          zoomMeetingUrl
        }`),
        sanityFetch(`*[_type == "livestream"] | order(_createdAt desc)[0] { isLive }`)
      ]);

      if (servicesPageData) setServicesPage(servicesPageData);
      if (servicesData) setServices(servicesData);
      if (settingsData) setSiteSettings(settingsData);
      if (livestreamData) setHasLiveStream(livestreamData.isLive);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
        </div>
      </div>
    );
  }

  if (!servicesPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">Services page content not found</h2>
          <p className="text-gray-500 dark:text-gray-400">Please add content in Sanity CMS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {servicesPage.title}
          </motion.h1>
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {servicesPage.subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {hasLiveStream ? (
              <button
                onClick={() => setShowLiveStream(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center shadow-lg"
              >
                <Radio className="w-5 h-5 mr-2 animate-pulse" />
                Watch Live Stream
              </button>
            ) : (
              <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg inline-flex items-center">
                <Radio className="w-5 h-5 mr-2" />
                No Live Stream Currently
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Service Times */}
      {services.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = iconMap[service.title] || BookOpen;
                return (
                  <motion.div 
                    key={service._id}
                    className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{service.title}</h3>
                    <div className="flex items-center justify-center mb-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{service.time}</span>
                    </div>
                    <div className="flex items-center justify-center mb-4 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{service.location}</span>
                    </div>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">{service.description}</p>
                    <button 
                      onClick={() => {
                        const now = new Date();
                        const [hours, minutes] = service.time.split(':');
                        const serviceDate = new Date(now);
                        serviceDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        
                        if (serviceDate < now) {
                          serviceDate.setDate(serviceDate.getDate() + 7);
                        }
                        
                        const startDate = serviceDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const endDate = new Date(serviceDate.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(service.description)}&location=${encodeURIComponent(service.location)}&recur=RRULE:FREQ=WEEKLY`;
                        window.open(calendarUrl, '_blank');
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Add to Calendar
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* What to Expect */}
      {servicesPage.whatToExpect && servicesPage.whatToExpect.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{servicesPage.whatToExpectSectionTitle}</h2>
              <p className="text-gray-600 dark:text-gray-300">Your first visit made easy - here&apos;s what you can expect when you join us</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesPage.whatToExpect.map((item, index) => {
                const Icon = iconMap[item.title] || Heart;
                return (
                  <motion.div 
                    key={item.title}
                    className="text-center p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Special Services */}
      {servicesPage.specialEvents && servicesPage.specialEvents.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-700">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{servicesPage.specialEventsSectionTitle}</h2>
              <p className="text-gray-600 dark:text-gray-300">Join us for these special worship experiences throughout the year</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesPage.specialEvents.map((event, index) => (
                <motion.div 
                  key={event.title}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {event.date}
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{event.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Online Services */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{servicesPage.onlineServicesTitle}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{servicesPage.onlineServicesDescription}</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => siteSettings?.youtubeChannelUrl && window.open(siteSettings.youtubeChannelUrl, '_blank')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Watch on YouTube
                </button>
                {siteSettings?.zoomMeetingUrl && (
                  <button 
                    onClick={() => window.open(siteSettings.zoomMeetingUrl, '_blank')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join via Zoom
                  </button>
                )}
                <button 
                  onClick={() => siteSettings?.youtubeChannelUrl && window.open(`${siteSettings.youtubeChannelUrl}?sub_confirmation=1`, '_blank')}
                  className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notifications
                </button>
              </div>
            </motion.div>
            <motion.div 
              className="bg-gray-100 dark:bg-gray-700 p-12 rounded-lg text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Video className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Live Stream Available</p>
              <small className="text-gray-600 dark:text-gray-300">Sundays at 10:00 AM</small>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Info */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">{servicesPage.planYourVisitTitle}</h2>
            <p className="text-xl mb-8">{servicesPage.planYourVisitDescription}</p>
            {servicesPage.planYourVisit && servicesPage.planYourVisit.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {servicesPage.planYourVisit.map((item, index) => {
                  const Icon = iconMap[item.title] || MapPin;
                  return (
                    <div className="flex items-center justify-center" key={item.title}>
                      <Icon className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <strong>{item.title}</strong>
                        <br />
                        <span className="text-blue-200">{item.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/contact'}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </button>
              <button 
                onClick={() => {
                  if (siteSettings?.googleMapsUrl) {
                    window.open(siteSettings.googleMapsUrl, '_blank');
                  } else {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        const destination = '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008';
                        window.open(`https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(destination)}`, '_blank');
                      },
                      () => {
                        window.open('https://maps.app.goo.gl/Qhr3P8sXxebH6skNA', '_blank');
                      }
                    );
                  }
                }}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stream Modal */}
      {showLiveStream && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-white text-2xl font-bold">Live Stream</h2>
              <button 
                onClick={() => setShowLiveStream(false)}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
            <Suspense fallback={<div className="text-white text-center">Loading stream...</div>}>
              <DynamicLiveStream />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}