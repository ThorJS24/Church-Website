'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Calendar, User, Clock, Search, BookOpen, Video, Headphones } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface Sermon {
  _id: string;
  title: string;
  speaker: {
    name: string;
  };
  series: {
    title: string;
  };
  date: string;
  mediaUrl?: string;
  transcript?: any;
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All Speakers');
  const [featuredSermon, setFeaturedSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sermonsData, seriesData, speakersData] = await Promise.all([
        sanityFetch(`*[_type == "sermon"] | order(date desc) {
          _id,
          title,
          speaker->{ name },
          series->{ title },
          date,
          mediaUrl,
          transcript
        }`),
        sanityFetch(`*[_type == "series"] { _id, title }`),
        sanityFetch(`*[_type == "speaker"] { _id, name }`)
      ]);
      
      if (sermonsData) {
        setSermons(sermonsData);
        setFeaturedSermon(sermonsData[0] || null);
      }
      if (seriesData) setSeries(seriesData);
      if (speakersData) setSpeakers(speakersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeries = selectedSeries === 'All Series' || sermon.series?.title === selectedSeries;
    const matchesSpeaker = selectedSpeaker === 'All Speakers' || sermon.speaker?.name === selectedSpeaker;
    
    return matchesSearch && matchesSeries && matchesSpeaker;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sermons...</p>
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
            Sermons
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Be encouraged and challenged by God's Word through our sermon library
          </motion.p>
        </div>
      </section>

      {/* Featured Sermon */}
      {featuredSermon && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Latest Sermon</h2>
            </div>
            
            <motion.div 
              className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative bg-gray-300 h-64 md:h-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-white bg-blue-600 rounded-full p-4 cursor-pointer hover:bg-blue-700 transition-colors" />
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="text-sm text-blue-600 font-semibold mb-2">{featuredSermon.series?.title}</div>
                  <h3 className="text-3xl font-bold mb-4">{featuredSermon.title}</h3>
                  <div className="flex items-center text-gray-600 mb-4 space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{featuredSermon.speaker?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(featuredSermon.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {featuredSermon.mediaUrl && (
                      <a href={featuredSermon.mediaUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Watch
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sermons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Series">All Series</option>
                {series.map(s => (
                  <option key={s._id} value={s.title}>{s.title}</option>
                ))}
              </select>
              
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Speakers">All Speakers</option>
                {speakers.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No sermons found</h3>
              <p className="text-gray-500">Check back soon for new sermons!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSermons.map((sermon, index) => (
                <motion.div 
                  key={sermon._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative bg-gray-300 h-48 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white bg-blue-600 rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-colors" />
                  </div>
                  
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-semibold mb-2">{sermon.series?.title}</div>
                    <h3 className="text-xl font-bold mb-3">{sermon.title}</h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3 space-x-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{sermon.speaker?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(sermon.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {sermon.mediaUrl && (
                        <a href={sermon.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}