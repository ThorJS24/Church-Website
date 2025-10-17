'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, CheckCircle, Users } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface AboutPage {
  title: string;
  subtitle: string;
  mission: string;
  vision: string;
  values: Array<{
    title: string;
    description: string;
  }>;
  valuesSectionTitle: string;
  storySectionTitle: string;
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  stats: Array<{
    number: string;
    label: string;
  }>;
  beliefsSectionTitle: string;
  beliefs: Array<{
    title: string;
    description: string;
  }>;
}

export default function AboutPage() {
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const aboutPageData = await sanityFetch(`*[_type == "aboutPage"][0] {
        title,
        subtitle,
        mission,
        vision,
        values,
        valuesSectionTitle,
        storySectionTitle,
        timeline,
        stats,
        beliefsSectionTitle,
        beliefs
      }`);
      
      if (aboutPageData) {
        setAboutPage(aboutPageData);
      }
    } catch (error) {
      console.error('Error fetching about page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!aboutPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">About page content not found</h2>
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
            {aboutPage.title}
          </motion.h1>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {aboutPage.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600">{aboutPage.mission}</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-600">{aboutPage.vision}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      {aboutPage.values && aboutPage.values.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{aboutPage.valuesSectionTitle}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {aboutPage.values.map((value, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {aboutPage.timeline && aboutPage.timeline.length > 0 && (
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{aboutPage.storySectionTitle}</h2>
            </div>
            <div className="relative">
              <div className="border-l-4 border-blue-600 absolute h-full top-0 left-1/2 -translate-x-1/2"></div>
              {aboutPage.timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="order-1 w-5/12"></div>
                  <div className="z-20 flex items-center order-1 bg-blue-600 shadow-xl w-8 h-8 rounded-full">
                    <h1 className="mx-auto font-semibold text-lg text-white">{index + 1}</h1>
                  </div>
                  <div className={`order-1 bg-white rounded-lg shadow-xl w-5/12 px-6 py-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm text-gray-500">{item.year}</p>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {aboutPage.stats && aboutPage.stats.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {aboutPage.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beliefs Section */}
      {aboutPage.beliefs && aboutPage.beliefs.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{aboutPage.beliefsSectionTitle}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {aboutPage.beliefs.map((belief, index) => (
                <motion.div
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">{belief.title}</h4>
                    <p className="text-gray-600">{belief.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}