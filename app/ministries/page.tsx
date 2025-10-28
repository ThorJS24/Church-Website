'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Baby, Music, BookOpen, Heart, Clock, MapPin } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface Ministry {
  _id: string;
  title: string;
  description: string;
  category: string | string[];
  ageGroup: string;
  meetingTime: string;
  location: string;
}

interface MinistriesPage {
  title: string;
  subtitle: string;
  categories: Array<{
    id: string;
    label: string;
  }>;
}

const iconMap = {
  children: Baby,
  youth: Users,
  adults: Users,
  worship: Music,
  outreach: Heart,
  default: BookOpen,
};

export default function MinistriesPage() {
  const [ministriesPage, setMinistriesPage] = useState<MinistriesPage | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const ministriesGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ministriesPageData, ministriesData] = await Promise.all([
        sanityFetch(`*[_type == "ministriesPage"][0] {
          title,
          subtitle,
          categories
        }`),
        sanityFetch(`*[_type == "ministry"] {
          _id,
          title,
          description,
          category,
          ageGroup,
          meetingTime,
          location
        }`)
      ]);

      if (ministriesPageData) setMinistriesPage(ministriesPageData);
      if (ministriesData) setMinistries(ministriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindMinistryClick = () => {
    if (ministriesGridRef.current) {
      ministriesGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredMinistries = activeCategory === 'all' 
    ? ministries 
    : ministries.filter(ministry => 
        Array.isArray(ministry.category) 
          ? ministry.category.includes(activeCategory)
          : ministry.category === activeCategory
      );

  const categories = [
    { id: 'all', label: 'All Ministries' },
    { id: 'children', label: 'Children' },
    { id: 'youth', label: 'Youth' },
    { id: 'adults', label: 'Adults' },
    { id: 'worship', label: 'Worship' },
    { id: 'outreach', label: 'Outreach' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading ministries...</p>
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
            {ministriesPage?.title || 'Our Ministries'}
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {ministriesPage?.subtitle || 'Find your place to serve, grow, and make a difference in our community'}
          </motion.p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-white dark:bg-gray-800" ref={ministriesGridRef}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredMinistries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No ministries found</h3>
              <p className="text-gray-500">Check back soon for new ministry opportunities!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMinistries.map((ministry, index) => {
                const categoryKey = Array.isArray(ministry.category) ? ministry.category[0] : ministry.category;
                const Icon = iconMap[categoryKey as keyof typeof iconMap] || iconMap.default;
                return (
                  <motion.div 
                    key={ministry._id}
                    className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">{ministry.title}</h3>
                    {ministry.ageGroup && (
                      <p className="text-blue-600 font-semibold text-center mb-4">{ministry.ageGroup}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{ministry.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {ministry.meetingTime && (
                        <div className="flex items-center justify-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{ministry.meetingTime}</span>
                        </div>
                      )}
                      {ministry.location && (
                        <div className="flex items-center justify-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{ministry.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link href="/ministries/volunteer" passHref legacyBehavior>
                        <a className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center">Join Ministry</a>
                      </Link>
                      <Link href={`/ministries/contact?ministry=${ministry._id}`} passHref legacyBehavior>
                        <a className="flex-1 border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-center">Learn More</a>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Ministry Opportunities */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Get Involved</h2>
            <p className="text-gray-600 dark:text-gray-300">There are many ways to serve and grow in our church community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-8 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Serve Others</h3>
              <p className="text-gray-600 mb-6">Use your gifts and talents to serve our church and community through various ministry opportunities.</p>
              <button onClick={handleFindMinistryClick} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Find Your Ministry
              </button>
            </motion.div>

            <motion.div 
              className="text-center p-8 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Grow in Faith</h3>
              <p className="text-gray-600 mb-6">Join small groups, Bible studies, and discipleship programs to deepen your relationship with God.</p>
              <a href="https://chat.whatsapp.com/1234567890" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join a Group
              </a>
            </motion.div>

            <motion.div 
              className="text-center p-8 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Heart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Build Community</h3>
              <p className="text-gray-600 mb-6">Connect with others through fellowship events, ministry teams, and community service projects.</p>
              <a href="https://chat.whatsapp.com/1234567890" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Connected
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Involved?</h2>
            <p className="text-xl mb-8">Take the next step and join a ministry that matches your passion and calling.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ministries/contact" passHref legacyBehavior>
                <a className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Contact Ministry Leader</a>
              </Link>
              <Link href="/ministries/volunteer" passHref legacyBehavior>
                <a className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">Volunteer Application</a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}