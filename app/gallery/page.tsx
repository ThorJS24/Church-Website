'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid, LayoutGrid, Eye, Share, Download, Upload, Image as ImageIcon, Calendar, Users, Tag, User, Camera } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';

interface GalleryImage {
  _id: string;
  title: string;
  category: string[];
  dateTaken: string;
  photographer?: string;
  tags?: string[];
  event?: { title: string };
  image: {
    asset: {
      url: string;
      metadata: {
        lqip: string;
      }
    };
  };
}

const stats = [
  { icon: ImageIcon, number: '150+', label: 'Photos' },
  { icon: Calendar, number: '25+', label: 'Events' },
  { icon: Users, number: '5+', label: 'Years' }
];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('dateTakenDesc');
  const [groupBy, setGroupBy] = useState('none');
  const [activeView, setActiveView] = useState('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const galleryData = await sanityFetch(`*[_type == "galleryImage" && isPublic == true] {
        _id,
        title,
        category,
        dateTaken,
        photographer,
        tags,
        event->{title},
        image {
          asset-> {
            url,
            metadata {
              lqip
            }
          }
        }
      }`);
      
      if (galleryData) {
        setGalleryImages(galleryData);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = useMemo(() => [...new Set(galleryImages.flatMap(img => img.category))], [galleryImages]);
  const allTags = useMemo(() => [...new Set(galleryImages.flatMap(img => img.tags || []))], [galleryImages]);

  const filteredAndSortedImages = useMemo(() => {
    let items = galleryImages.filter(item => {
      const categoryMatch = activeCategories.length === 0 || item.category.some(c => activeCategories.includes(c));
      const tagMatch = activeTags.length === 0 || item.tags?.some(t => activeTags.includes(t));
      return categoryMatch && tagMatch;
    });

    items.sort((a, b) => {
      switch (sortBy) {
        case 'dateTakenAsc': return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
        case 'titleAsc': return a.title.localeCompare(b.title);
        case 'titleDesc': return b.title.localeCompare(a.title);
        default: return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime();
      }
    });

    return items;
  }, [galleryImages, activeCategories, activeTags, sortBy]);

  const groupedImages = useMemo(() => {
    if (groupBy === 'none') return { 'All Images': filteredAndSortedImages };

    return filteredAndSortedImages.reduce((acc, item) => {
      let groupKey = 'Uncategorized';
      if (groupBy === 'category' && item.category.length > 0) {
        groupKey = item.category[0];
      } else if (groupBy === 'year') {
        groupKey = new Date(item.dateTaken).getFullYear().toString();
      } else if (groupBy === 'event' && item.event) {
        groupKey = item.event.title;
      }

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, GalleryImage[]>);
  }, [filteredAndSortedImages, groupBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
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
            Church Gallery
          </motion.h1>
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Capturing moments of faith, fellowship, and community
          </motion.p>
          
          <div className="flex justify-center gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and View Options */}
      <section className="py-8 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="dateTakenDesc">Date (Newest)</option>
                <option value="dateTakenAsc">Date (Oldest)</option>
                <option value="titleAsc">Title (A-Z)</option>
                <option value="titleDesc">Title (Z-A)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Group By</label>
              <select onChange={(e) => setGroupBy(e.target.value)} value={groupBy} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="none">None</option>
                <option value="category">Category</option>
                <option value="year">Year</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <button onClick={() => setActiveView('grid')} className={`p-2 rounded-lg transition-colors ${activeView === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Grid View"><Grid className="w-5 h-5" /></button>
              <button onClick={() => setActiveView('masonry')} className={`p-2 rounded-lg transition-colors ${activeView === 'masonry' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} title="Masonry View"><LayoutGrid className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Categories</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {allCategories.map(c => <button key={c} onClick={() => setActiveCategories(prev => prev.includes(c) ? prev.filter(pc => pc !== c) : [...prev, c])} className={`px-3 py-1 text-sm rounded-full ${activeCategories.includes(c) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{c}</button>)}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Tags</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {allTags.map(t => <button key={t} onClick={() => setActiveTags(prev => prev.includes(t) ? prev.filter(pt => pt !== t) : [...prev, t])} className={`px-3 py-1 text-sm rounded-full ${activeTags.includes(t) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t}</button>)}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {Object.entries(groupedImages).map(([groupTitle, images]) => (
            <div key={groupTitle} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{groupTitle}</h2>
              {images.length === 0 ? (
                <p>No images in this group.</p>
              ) : (
                <div className={`${activeView === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6'}`}>
                  {images.map((item, index) => (
                    <motion.div
                      key={item._id}
                      className={`group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${activeView === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      onClick={() => setSelectedImage(item._id)}
                    >
                      <div className={`aspect-[4/3] bg-gray-300 flex items-center justify-center`}>
                        <Image 
                          src={item.image.asset.url} 
                          alt={item.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                          placeholder="blur"
                          blurDataURL={item.image.asset.metadata.lqip}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center p-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                          <h4 className="text-lg font-bold">{item.title}</h4>
                          <p className="text-sm">{new Date(item.dateTaken).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Share Your Photos</h2>
            <p className="text-xl mb-8">Help us capture more memories by sharing your photos from church events</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto">
              <Upload className="w-5 h-5 mr-2" />
              Upload Photos
            </button>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const image = galleryImages.find(item => item._id === selectedImage);
              if (!image) return null;
              return (
                <>
                  <div className="relative w-[80vw] h-[80vh]">
                    <Image 
                      src={image.image.asset.url} 
                      alt={image.title}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{image.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {image.tags?.map(tag => <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                    <p className="text-gray-600 mb-1">Category: {image.category.join(', ')}</p>
                    <p className="text-gray-600 mb-1">Date: {new Date(image.dateTaken).toLocaleDateString()}</p>
                    {image.photographer && <p className="text-gray-600 mb-1">Photographer: {image.photographer}</p>}
                    {image.event && <p className="text-gray-600 mb-4">Event: {image.event.title}</p>}
                    <div className="flex gap-4 justify-center">
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"><Share className="w-4 h-4 mr-2" />Share</button>
                      <a href={`${image.image.asset.url}?dl=`} download className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"><Download className="w-4 h-4 mr-2" />Download</a>
                      <button onClick={() => setSelectedImage(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Close</button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}