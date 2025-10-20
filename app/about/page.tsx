'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, CheckCircle, Play, Video } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

interface StaffMember {
  _id: string;
  name: string;
  position: string;
  bio: string;
  image: any;
}

interface Pastor {
  _id: string;
  name: string;
  title: string;
  bio: string;
  image: any;
  email?: string;
  phone?: string;
  yearsOfService?: number;
  education?: string[];
  specialties?: string[];
}

interface Sermon {
  _id: string;
  title: string;
  videoUrl: string;
}

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
  pastorSectionTitle: string;
  pastor?: {
    name: string;
    position: string;
    bio: string;
    image: any;
    latestSermon?: {
      title: string;
      videoUrl: string;
    };
  };
}

const YouTubePlayer = ({ videoId, onClose }: { videoId: string, onClose: () => void }) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
        },
      });
    };

    return () => {
      (window as any).onYouTubeIframeAPIReady = null;
    };
  }, [videoId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div id="player"></div>
      </div>
    </div>
  );
};

export default function AboutPage() {
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null);
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aboutPageData, pastorsData] = await Promise.all([
        sanityFetch(`*[_type == "aboutPage"][0]`),
        sanityFetch(`*[_type == "pastor"] | order(yearsOfService desc) {
          _id,
          name,
          title,
          bio,
          image,
          email,
          phone,
          yearsOfService,
          education,
          specialties
        }`)
      ]);
      
      if (aboutPageData) setAboutPage(aboutPageData);
      if (pastorsData) setPastors(pastorsData);
    } catch (error) {
      console.error('Error fetching about page:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
          <p className="text-gray-500">Please add content in Sanity CMS, including assigning a pastor to the about page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {playingVideo && <YouTubePlayer videoId={playingVideo} onClose={() => setPlayingVideo(null)} />}

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

      {/* Pastor Section */}
      {aboutPage.pastor && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{aboutPage.pastorSectionTitle || 'Meet Our Pastor'}</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <motion.div
                className="md:w-1/3 text-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={urlFor(aboutPage.pastor.image).width(400).height(400).url()}
                  alt={aboutPage.pastor.name}
                  width={400}
                  height={400}
                  className="rounded-full mx-auto shadow-lg"
                />
              </motion.div>
              <motion.div
                className="md:w-2/3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-2">{aboutPage.pastor.name}</h3>
                <p className="text-xl text-gray-600 mb-4">{aboutPage.pastor.position}</p>
                <p className="text-gray-600">{aboutPage.pastor.bio}</p>
                {aboutPage.pastor.latestSermon && (
                  <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Watch the Latest Sermon:</h4>
                    <div className="flex items-center justify-between">
                      <p>“{aboutPage.pastor.latestSermon.title}”</p>
                      <button 
                        onClick={() => setPlayingVideo(getYouTubeVideoId(aboutPage.pastor?.latestSermon?.videoUrl || ''))}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Play className="w-4 h-4 mr-2" />
                        Watch
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Pastors Section */}
      {pastors.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-700">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Pastoral Team</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastors.map((pastor, index) => (
                <motion.div
                  key={pastor._id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {pastor.image && (
                    <Image
                      src={urlFor(pastor.image).width(200).height(200).url()}
                      alt={pastor.name}
                      width={200}
                      height={200}
                      className="rounded-full mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{pastor.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{pastor.title}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{pastor.bio}</p>
                  {pastor.yearsOfService && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pastor.yearsOfService} years of service</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {aboutPage.values && aboutPage.values.length > 0 && (
        <section className="py-16 bg-gray-100">
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
        <section className="py-16 bg-white">
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