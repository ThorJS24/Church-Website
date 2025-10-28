'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Calendar, User, Clock, Search, Filter, BookOpen, Video, Headphones, Radio } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import { extractYouTubeId, getYouTubeEmbedUrl } from '@/lib/utils';
import Image from 'next/image';
import DivineEffects from '@/components/DivineEffects';
import SacredText from '@/components/SacredText';
import DivineButton from '@/components/DivineButton';
import HeavenlyCard from '@/components/HeavenlyCard';

const DynamicLiveStream = lazy(() => import('@/components/DynamicLiveStream'));

interface Sermon {
  _id: string;
  title: string;
  subtitle?: string;
  speaker: {
    name: string;
  };
  series: {
    title: string;
  };
  date: string;
  youtubeUrl?: string;
  transcript?: any;
  image?: {
    asset: {
      url: string;
    };
  };
  duration?: number;
  scripture?: string;
  description?: string;
  featured?: boolean;
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sermonsData, seriesData, speakersData, livestreamData] = await Promise.all([
        sanityFetch(`*[_type == "sermon"] | order(date desc)[0...20] {
          _id,
          title,
          subtitle,
          speaker->{ name },
          series->{ title },
          date,
          youtubeUrl,
          image{
            asset->{
              url
            }
          },
          duration,
          scripture,
          description,
          featured
        }`),
        sanityFetch(`*[_type == "series"] { _id, title }`),
        sanityFetch(`*[_type == "speaker"] { _id, name }`),
        sanityFetch(`*[_type == "livestream"] | order(_createdAt desc)[0] { isLive }`)
      ]);
      
      if (sermonsData) {
        setSermons(sermonsData);
        setFeaturedSermon(sermonsData[0] || null);
      }
      if (seriesData) setSeries(seriesData);
      if (speakersData) setSpeakers(speakersData);
      if (livestreamData) setHasLiveStream(livestreamData.isLive);
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

  const groupedSermons = filteredSermons.reduce((groups: any, sermon) => {
    const date = new Date(sermon.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!groups[yearMonth]) {
      groups[yearMonth] = {
        monthName,
        sermons: []
      };
    }
    groups[yearMonth].sermons.push(sermon);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading sermons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 relative">
      <DivineEffects />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20 relative overflow-hidden">
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
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Be encouraged and challenged by God&apos;s Word through our sermon library
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {hasLiveStream ? (
              <DivineButton
                onClick={() => setShowLiveStream(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 inline-flex items-center"
              >
                <Radio className="w-5 h-5 mr-2 animate-pulse" />
                Watch Live Stream
              </DivineButton>
            ) : (
              <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg inline-flex items-center">
                <Radio className="w-5 h-5 mr-2" />
                No Live Stream Currently
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Sermon */}
      {featuredSermon && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Latest Sermon</h2>
            </div>
            
            <motion.div 
              className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative h-64 md:h-full overflow-hidden">
                    {featuredSermon.image?.asset?.url ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={featuredSermon.image.asset.url} 
                          alt={featuredSermon.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          {featuredSermon.youtubeUrl && extractYouTubeId(featuredSermon.youtubeUrl) && (
                            <button
                              onClick={() => setSelectedVideo(featuredSermon.youtubeUrl!)}
                              className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                            >
                              <Play className="w-10 h-10 text-white ml-1" />
                            </button>
                          )}
                        </div>
                        {featuredSermon.duration && (
                          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded">
                            {featuredSermon.duration} minutes
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {featuredSermon.youtubeUrl && extractYouTubeId(featuredSermon.youtubeUrl) ? (
                          <button
                            onClick={() => setSelectedVideo(featuredSermon.youtubeUrl!)}
                            className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                          >
                            <Play className="w-10 h-10 text-white ml-1" />
                          </button>
                        ) : (
                          <Play className="w-16 h-16 text-white bg-blue-600 rounded-full p-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-blue-600 font-semibold">{featuredSermon.series?.title}</div>
                    <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-semibold">
                      Latest
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{featuredSermon.title}</h3>
                  {featuredSermon.subtitle && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{featuredSermon.subtitle}</p>
                  )}
                  
                  {featuredSermon.scripture && (
                    <div className="text-purple-600 font-medium mb-3">
                      📖 {featuredSermon.scripture}
                    </div>
                  )}
                  
                  {featuredSermon.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{featuredSermon.description}</p>
                  )}
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4 space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{featuredSermon.speaker?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(featuredSermon.date).toLocaleDateString()}</span>
                    </div>
                    {featuredSermon.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{featuredSermon.duration} min</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {featuredSermon.youtubeUrl && extractYouTubeId(featuredSermon.youtubeUrl) && (
                      <button
                        onClick={() => setSelectedVideo(featuredSermon.youtubeUrl!)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-semibold"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        Watch Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sermons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All Series">All Series</option>
                {series.map(s => (
                  <option key={s._id} value={s.title}>{s.title}</option>
                ))}
              </select>
              
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All Speakers">All Speakers</option>
                {speakers.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
              
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'timeline' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Timeline
                </button>
              </div>
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
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No sermons found</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back soon for new sermons!</p>
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="space-y-8">
              {Object.entries(groupedSermons)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([yearMonth, group]: [string, any]) => (
                <div key={yearMonth} className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">{group.monthName}</h3>
                  <div className="space-y-4">
                    {group.sermons.map((sermon: Sermon) => (
                      <div key={sermon._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 flex-shrink-0">
                            {sermon.image?.asset?.url ? (
                              <Image src={sermon.image.asset.url} alt={sermon.title} fill sizes="80px" className="object-cover rounded" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{sermon.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{sermon.speaker?.name} • {new Date(sermon.date).toLocaleDateString()}</p>
                            {sermon.scripture && <p className="text-purple-600 text-sm">📖 {sermon.scripture}</p>}
                          </div>
                          {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                            <button
                              onClick={() => setSelectedVideo(sermon.youtubeUrl!)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                              Watch
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSermons.map((sermon, index) => (
                <motion.div 
                  key={sermon._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {sermon.image?.asset?.url || sermon.youtubeUrl ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={sermon.image?.asset?.url || `https://img.youtube.com/vi/${extractYouTubeId(sermon.youtubeUrl || '')}/maxresdefault.jpg`} 
                          alt={sermon.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-sermon.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                            <button
                              onClick={() => setSelectedVideo(sermon.youtubeUrl!)}
                              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                            >
                              <Play className="w-8 h-8 text-white ml-1" />
                            </button>
                          )}
                        </div>
                        {sermon.duration && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {sermon.duration}min
                          </div>
                        )}
                        {sermon.featured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-semibold">
                            Featured
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) ? (
                          <button
                            onClick={() => setSelectedVideo(sermon.youtubeUrl!)}
                            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                          >
                            <Play className="w-8 h-8 text-white ml-1" />
                          </button>
                        ) : (
                          <Play className="w-12 h-12 text-white bg-blue-600 rounded-full p-3" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-blue-600 font-semibold">{sermon.series?.title}</div>
                      {sermon.duration && (
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {sermon.duration}min
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white">{sermon.title}</h3>
                    {sermon.subtitle && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{sermon.subtitle}</p>
                    )}
                    
                    {sermon.scripture && (
                      <div className="text-sm text-purple-600 font-medium mb-2">
                        📖 {sermon.scripture}
                      </div>
                    )}
                    
                    {sermon.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{sermon.description}</p>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-4 space-x-3">
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
                      {sermon.youtubeUrl && extractYouTubeId(sermon.youtubeUrl) && (
                        <button
                          onClick={() => setSelectedVideo(sermon.youtubeUrl!)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{paddingBottom: '56.25%'}}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYouTubeEmbedUrl(selectedVideo) || ''}
                title="Sermon Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}