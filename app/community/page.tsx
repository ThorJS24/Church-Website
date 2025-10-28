'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe, Users, MessageCircle, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import DivineEffects from '@/components/DivineEffects';
import SacredText from '@/components/SacredText';
import HeavenlyCard from '@/components/HeavenlyCard';

interface CommunityData {
  title: string;
  subtitle: string;
  missions: Array<{
    title: string;
    description: string;
    location: string;
    image?: any;
  }>;
  outreachStories: Array<{
    title: string;
    story: string;
    date: string;
    image?: any;
  }>;
  communityResources: Array<{
    title: string;
    description: string;
    contactInfo: string;
    schedule?: string;
  }>;
  testimonies: Array<{
    name: string;
    testimony: string;
    date: string;
    image?: any;
  }>;
}

export default function CommunityPage() {
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await sanityFetch(`*[_type == "communityPage"][0]`);
      if (data) setCommunityData(data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 relative">
      <DivineEffects />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <SacredText size="xl" className="text-5xl font-bold mb-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {communityData?.title || "Community & Outreach"}
            </motion.h1>
          </SacredText>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {communityData?.subtitle || "Serving our community with love and compassion"}
          </motion.p>
        </div>
      </section>

      {/* Missions Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Globe className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>Missions & Local Outreach</h2>
            </SacredText>
          </div>
          
          {communityData?.missions && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityData.missions.map((mission, index) => (
                <HeavenlyCard key={mission.title} glowIntensity="medium" delay={index * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{mission.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{mission.description}</p>
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {mission.location}
                    </div>
                  </motion.div>
                </HeavenlyCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Outreach Stories */}
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Heart className="w-16 h-16 text-red-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>Outreach Stories</h2>
            </SacredText>
          </div>
          
          {communityData?.outreachStories && (
            <div className="grid md:grid-cols-2 gap-8">
              {communityData.outreachStories.map((story, index) => (
                <HeavenlyCard key={story.title} glowIntensity="medium" delay={index * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{story.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{story.story}</p>
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(story.date).toLocaleDateString()}
                    </div>
                  </motion.div>
                </HeavenlyCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Resources */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>Community Resources</h2>
            </SacredText>
          </div>
          
          {communityData?.communityResources && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityData.communityResources.map((resource, index) => (
                <HeavenlyCard key={resource.title} glowIntensity="medium" delay={index * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{resource.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{resource.description}</p>
                    {resource.schedule && (
                      <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {resource.schedule}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Phone className="w-4 h-4 mr-2" />
                      {resource.contactInfo}
                    </div>
                  </motion.div>
                </HeavenlyCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonies */}
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <MessageCircle className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>Stories of Life Change</h2>
            </SacredText>
          </div>
          
          {communityData?.testimonies && (
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {communityData.testimonies.map((testimony, index) => (
                <HeavenlyCard key={testimony.name} glowIntensity="medium" delay={index * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
                      "{testimony.testimony}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <p className="font-bold text-gray-900 dark:text-white">{testimony.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(testimony.date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                </HeavenlyCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}