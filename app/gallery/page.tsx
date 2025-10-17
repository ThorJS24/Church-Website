'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, LayoutGrid, Eye, Share, Download, Upload, Image as ImageIcon, Calendar, Users } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  date: string;
  image: {
    asset: {
      url: string;
    };
  };
}

const categories = ['all', 'services', 'events', 'ministry', 'community', 'youth', 'children'];
const views = ['grid', 'timeline', 'masonry'];

const stats = [
  { icon: ImageIcon, number: '150+', label: 'Photos' },
  { icon: Calendar, number: '25+', label: 'Events' },
  { icon: Users, number: '5+', label: 'Years' }
];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const galleryData = await sanityFetch(`*[_type == "galleryImage"] | order(date desc) {
        _id,
        title,
        category,
        date,
        image {
          asset-> {
            url
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

  const filteredItems = activeFilter === 'all' 
    ? galleryImages 
    : galleryImages.filter(item => item.category === activeFilter);

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
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                    activeFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Photos' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* View Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('masonry')}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === 'masonry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Masonry View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No images found</h3>
              <p className="text-gray-500">Check back soon for new photos from our events!</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {activeView === 'grid' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      onClick={() => setSelectedImage(item._id)}
                    >
                      <div className="aspect-[4/3] bg-gray-300 flex items-center justify-center">
                        {item.image?.asset?.url ? (
                          <img 
                            src={item.image.asset.url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-gray-500" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                          <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                          <p className="text-sm mb-4">{new Date(item.date).toLocaleDateString()}</p>
                          <div className="flex gap-3 justify-center">
                            <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-40 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-40 transition-colors">
                              <Share className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-40 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Masonry View */}
              {activeView === 'masonry' && (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      className="break-inside-avoid mb-6 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className={`bg-gray-300 flex items-center justify-center ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                        {item.image?.asset?.url ? (
                          <img 
                            src={item.image.asset.url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-gray-500" />
                        )}
                      </div>
                      <div className="p-4">
                        <h5 className="font-bold mb-1">{item.title}</h5>
                        <span className="text-gray-600 text-sm">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
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
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {(() => {
              const image = galleryImages.find(item => item._id === selectedImage);
              return (
                <>
                  <div className="aspect-[4/3] bg-gray-300 flex items-center justify-center">
                    {image?.image?.asset?.url ? (
                      <img 
                        src={image.image.asset.url} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-32 h-32 text-gray-500" />
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-xl font-bold mb-2">{image?.title}</h4>
                    <p className="text-gray-600 mb-4">{image?.date}</p>
                    <div className="flex gap-4 justify-center">
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Close
                      </button>
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