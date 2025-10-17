'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Church, Heart, Mail, Users, Calendar, MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getRandomVerse } from '@/lib/verses';
import { sanityFetch } from '@/lib/sanity-fetch';

const quickActions = [
  {
    href: '/services',
    icon: Church,
    title: 'Join Us Sunday',
    description: 'Worship with us every Sunday at 10:00 AM'
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

const iconMap = {
  Members: Users,
  Ministries: Heart,
  'Years Serving': Calendar,
  'Lives Touched': Heart,
};

export default function Home() {
  const [currentVerse, setCurrentVerse] = useState({
    english: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    tamil: "வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.",
    tamilReference: "மத்தேயு 11:28"
  });
  const [announcements, setAnnouncements] = useState([]);
  const [homePage, setHomePage] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    // Set initial random verse on client-side to avoid hydration mismatch
    setCurrentVerse(getRandomVerse());

    const intervalId = setInterval(() => {
      setCurrentVerse(getRandomVerse());
    }, 10000);

    async function fetchData() {
      const announcementsQuery = `*[_type == "announcement"]`;
      const homePageQuery = `*[_type == "homePage"][0]`;
      const siteSettingsQuery = `*[_type == "siteSettings"][0]`;

      const [sanityAnnouncements, sanityHomePage, sanitySiteSettings] = await Promise.all([
        sanityFetch(announcementsQuery),
        sanityFetch(homePageQuery),
        sanityFetch(siteSettingsQuery),
      ]);

      setAnnouncements(sanityAnnouncements);
      setHomePage(sanityHomePage);
      setSiteSettings(sanitySiteSettings);
    }

    fetchData();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-12 sm:py-20 overflow-hidden min-h-screen flex items-center hero-bg with-image">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight heavenly-float">
              {homePage?.welcomeMessage} <span className="text-golden block sm:inline">{siteSettings?.churchName}</span>
            </h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl mb-8 divine-glow">
              <p className="text-lg sm:text-xl italic mb-4 text-golden leading-relaxed">
                "{currentVerse.english}"
              </p>
              <p className="text-base opacity-90">
                {currentVerse.reference}
              </p>
            </div>
            
            <p className="text-xl sm:text-2xl mb-8 opacity-90">{homePage?.tagline}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="btn-golden">
                Join Us Sunday 10:00 AM
              </Link>
              <Link href="/about" className="btn-outline">
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-12 sm:py-16 heavenly-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="card-divine p-8 shadow-divine"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-divine">Latest Announcements</h2>
            <div className="space-y-6">
              {announcements && announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-4 card rounded-2xl card-hover transition-divine"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full mr-4 divine-glow">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2 text-primary">{announcement.title}</h4>
                      <p className="text-secondary mb-2">{announcement.content}</p>
                      <small className="text-muted">{announcement.date}</small>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary">No announcements at this time.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {homePage?.stats && homePage.stats.length > 0 && (
        <section className="py-12 sm:py-16 bg-accent text-accent-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {homePage.stats.map((stat, index) => {
                const Icon = iconMap[stat.label] || Users;
                return (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-4" />
                    <div className="text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="opacity-80">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions Section */}
      <section className="py-12 sm:py-16 bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-divine">Connect With Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={action.href} className="block card-divine p-8 card-hover text-center group shadow-divine heavenly-float">
                  <action.icon className="w-12 h-12 mx-auto mb-4 divine-pulse" style={{color: 'rgb(var(--accent-primary))'}} />
                  <h3 className="text-xl font-bold mb-3 text-primary">{action.title}</h3>
                  <p className="text-secondary mb-4">{action.description}</p>
                  <ArrowRight className="w-5 h-5 mx-auto group-hover:translate-x-1 transition-transform" style={{color: 'rgb(var(--accent-primary))'}} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-12 sm:py-16 heavenly-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-divine">Find Us</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">{siteSettings?.churchName}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{color: 'rgb(var(--accent-primary))'}} />
                  <div className="text-sm leading-relaxed text-secondary">
                    {siteSettings?.address}
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" style={{color: 'rgb(var(--accent-primary))'}} />
                  <span className="text-secondary">{siteSettings?.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" style={{color: 'rgb(var(--accent-primary))'}} />
                  <span className="text-secondary">{siteSettings?.email}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="card-divine h-80 rounded-2xl flex items-center justify-center shadow-divine"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 divine-pulse" style={{color: 'rgb(var(--accent-primary))'}} />
                <p className="text-secondary">Interactive Map</p>
                <p className="text-muted">Find us on Google Maps</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}