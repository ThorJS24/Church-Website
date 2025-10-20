'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Heart, Mail, Users, Calendar, MapPin, Phone, Clock, ArrowRight, Youtube, Facebook, Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getRandomVerse } from '@/lib/verses';
import { sanityFetch } from '@/lib/sanity-fetch';

const quickActions = [
  {
    href: '/services',
    icon: Church,
    title: 'Join Us Sunday',
    description: 'Worship with us every Sunday at 9:30 AM'
  },
  {
    href: '/give',
    icon: Heart,
    title: 'Give Online',
    description: 'Support our mission with a secure donation'
  },
  {
    href: '/prayer',
    icon: Heart,
    title: 'Prayer Request',
    description: 'Share your prayer needs with our community'
  },
  {
    href: '/contact',
    icon: Mail,
    title: 'Get In Touch',
    description: 'Contact us with questions or to learn more'
  }
];

export default function Home() {
  const [currentVerse, setCurrentVerse] = useState({
    english: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    tamil: "வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.",
    tamilReference: "மத்தேயு 11:28"
  });
  const [announcements, setAnnouncements] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    setCurrentVerse(getRandomVerse());

    const intervalId = setInterval(() => {
      setCurrentVerse(getRandomVerse());
    }, 10000);

    async function fetchData() {
      const [sanityAnnouncements, sanitySiteSettings] = await Promise.all([
        sanityFetch(`*[_type == "announcement"]`),
        sanityFetch(`*[_type == "siteSettings"][0] {
          churchName,
          address,
          phoneNumber,
          email,
          youtubeChannelUrl,
          facebookUrl,
          instagramUrl,
          googleMapsUrl,
          whatsappGroupUrl
        }`),
      ]);

      setAnnouncements(sanityAnnouncements || []);
      setSiteSettings(sanitySiteSettings);
    }

    fetchData();
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 overflow-hidden" style={{backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-700/80"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-yellow-400 block sm:inline">{siteSettings?.churchName || 'Salem Primitive Baptist Church'}</span>
            </h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl mb-8">
              <p className="text-lg sm:text-xl italic mb-4 text-yellow-300 leading-relaxed">
                "{currentVerse.english}"
              </p>
              <p className="text-base opacity-90">
                {currentVerse.reference}
              </p>
            </div>
            
            <p className="text-xl sm:text-2xl mb-8 opacity-90">A place where faith meets community, and hope comes alive</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold transition-colors">
                Join Us Sunday 9:30 AM
              </Link>
              <Link href="/about" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors">
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Connect With Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={action.href} className="block bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center group">
                  <action.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{action.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{action.description}</p>
                  <ArrowRight className="w-5 h-5 mx-auto text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-700">
          <div className="container mx-auto px-4">
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Latest Announcements</h2>
              <div className="space-y-6">
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => alert(`More details about: ${announcement.title}`)}
                  >
                    <div className="bg-blue-600 p-3 rounded-full mr-4">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{announcement.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{announcement.content}</p>
                      <small className="text-gray-500 dark:text-gray-400">{announcement.date}</small>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Location Section */}
      <section className="py-16 bg-white dark:bg-gray-800 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Find Us</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{siteSettings?.churchName || 'Salem Primitive Baptist Church'}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-blue-600" />
                  <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {siteSettings?.address || '223/838, Near north post office, Kannangurichi main road, Chinnathirupathi, Salem TN, PIN- 636008'}
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">{siteSettings?.phoneNumber || '+91 94871 62485'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">{siteSettings?.email || 'elicohen.mossad.il@gmail.com'}</span>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="flex space-x-4 mt-6">
                {siteSettings?.youtubeChannelUrl && (
                  <a href={siteSettings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {siteSettings?.facebookUrl && (
                  <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {siteSettings?.instagramUrl && (
                  <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-all">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {siteSettings?.whatsappGroupUrl && (
                  <a href={siteSettings.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
            
            <motion.div
              className="h-80 rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d289.6717292106369!2d78.16560039927737!3d11.678130577350974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf16da41b56e5%3A0x30049390bc14cac1!2sSALEM%20PRIMITIVE%20BAPTIST%20CHURCH!5e1!3m2!1sen!2sin!4v1760932034062!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}