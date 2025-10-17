'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, BookOpen, Clock, MapPin, Calendar, Video, Coffee, Baby, Users } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

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

const iconMap = {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesPageData, servicesData] = await Promise.all([
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
        }`)
      ]);

      if (servicesPageData) setServicesPage(servicesPageData);
      if (servicesData) setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (!servicesPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Services page content not found</h2>
          <p className="text-gray-500">Please add content in Sanity CMS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {servicesPage.subtitle}
          </motion.p>
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
                    className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <div className="flex items-center justify-center mb-2 text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{service.time}</span>
                    </div>
                    <div className="flex items-center justify-center mb-4 text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{service.location}</span>
                    </div>
                    <p className="mb-4">{service.description}</p>
                    <button 
                      onClick={() => {
                        const startDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const endDate = new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(service.description)}&location=${encodeURIComponent(service.location)}`;
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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{servicesPage.whatToExpectSectionTitle}</h2>
              <p className="text-gray-600">Your first visit made easy - here's what you can expect when you join us</p>
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
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Special Services */}
      {servicesPage.specialEvents && servicesPage.specialEvents.length > 0 && (
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{servicesPage.specialEventsSectionTitle}</h2>
              <p className="text-gray-600">Join us for these special worship experiences throughout the year</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesPage.specialEvents.map((event, index) => (
                <motion.div 
                  key={event.title}
                  className="bg-white p-6 rounded-lg shadow-lg relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {event.date}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                  <p className="text-gray-600">{event.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Online Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4">{servicesPage.onlineServicesTitle}</h2>
              <p className="text-gray-600 mb-6">{servicesPage.onlineServicesDescription}</p>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Watch Online
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  Get Notifications
                </button>
              </div>
            </motion.div>
            <motion.div 
              className="bg-gray-100 p-12 rounded-lg text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Video className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2">Live Stream Available</p>
              <small className="text-gray-600">Sundays at 10:00 AM</small>
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
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Get Directions
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}