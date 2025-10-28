'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, Award, Heart, BookOpen, X } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import Image from 'next/image';

interface Pastor {
  _id: string;
  name: string;
  title: string;
  bio: any;
  image?: {
    asset: {
      url: string;
    };
  };
  email?: string;
  phone?: string;
  yearsOfService?: number;
  ordainedDate?: string;
  specialties?: string[];
}

export default function PastorsPage() {
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null);

  useEffect(() => {
    fetchPastors();
  }, []);

  const fetchPastors = async () => {
    setLoading(true);
    try {
      const pastorsData = await sanityFetch(`*[_type == "pastor"] {
        _id,
        name,
        title,
        bio,
        image {
          asset-> {
            url
          }
        },
        email,
        phone,
        yearsOfService,
        ordainedDate,
        specialties
      }`);
      
      if (pastorsData) {
        // Sort by hierarchy based on title
        const hierarchyOrder = {
          'Senior Pastor': 1,
          'Lead Pastor': 2,
          'Associate Pastor': 3,
          'Assistant Pastor': 4,
          'Youth Pastor': 5,
          'Children Pastor': 6,
          'Worship Pastor': 7,
          'Pastor': 8
        };
        
        // Remove duplicates based on name and title
        const uniquePastors = pastorsData.filter((pastor: Pastor, index: number, self: Pastor[]) => 
          index === self.findIndex(p => p.name === pastor.name && p.title === pastor.title)
        );
        
        const sortedPastors = uniquePastors.sort((a: Pastor, b: Pastor) => {
          const aOrder = hierarchyOrder[a.title as keyof typeof hierarchyOrder] || 99;
          const bOrder = hierarchyOrder[b.title as keyof typeof hierarchyOrder] || 99;
          return aOrder - bOrder;
        });
        
        setPastors(sortedPastors);
      }
    } catch (error) {
      console.error('Error fetching pastors:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBio = (bio: any) => {
    if (typeof bio === 'string') return bio;
    if (Array.isArray(bio)) {
      return bio.map((block: any) => {
        if (block._type === 'block') {
          return block.children?.map((child: any) => child.text).join('') || '';
        }
        return '';
      }).join('\n');
    }
    return 'No biography available';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading pastoral team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-400/15 rounded-full blur-md animate-ping"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-8"
            >
              <BookOpen className="w-20 h-20 mx-auto text-yellow-300 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-lg">
              Our Pastoral Team
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8"
            >
              Meet the shepherds who guide our congregation with wisdom, love, and unwavering faith
            </motion.p>

          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

        {pastors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <User className="mx-auto w-20 h-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
              No pastoral information available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Please check back soon for updates about our pastoral team.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastors.map((pastor, index) => (
              <motion.div
                key={pastor._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {pastor.image?.asset?.url ? (
                      <img
                        src={pastor.image.asset.url}
                        alt={pastor.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pastor.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{pastor.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    {pastor.yearsOfService && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        {pastor.yearsOfService}y service
                      </span>
                    )}
                    {pastor.ordainedDate && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        Est. {new Date(pastor.ordainedDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedPastor(pastor)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pastor Detail Modal */}
      <AnimatePresence>
        {selectedPastor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPastor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPastor.name}</h2>
                <button onClick={() => setSelectedPastor(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-8">
                  {selectedPastor.image?.asset?.url ? (
                    <img src={selectedPastor.image.asset.url} alt={selectedPastor.name} className="w-full aspect-video object-cover rounded-lg" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <User className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                    <div className="mb-6">
                      <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">{selectedPastor.title}</p>
                      <div className="flex flex-wrap gap-3 mb-6">
                        {selectedPastor.yearsOfService && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                            {selectedPastor.yearsOfService} years of service
                          </span>
                        )}
                        {selectedPastor.ordainedDate && (
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                            Ordained {new Date(selectedPastor.ordainedDate).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{renderBio(selectedPastor.bio)}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {selectedPastor.email && (
                        <a href={`mailto:${selectedPastor.email}`} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                          <Mail className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300 break-all text-sm leading-relaxed">{selectedPastor.email}</span>
                        </a>
                      )}
                      {selectedPastor.phone && (
                        <a href={`tel:${selectedPastor.phone}`} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                          <Phone className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300 break-all text-sm leading-relaxed">{selectedPastor.phone}</span>
                        </a>
                      )}
                    </div>
                    
                    {selectedPastor.specialties && selectedPastor.specialties.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ministry Focus Areas</h3>
                        <div className="flex flex-wrap gap-3">
                          {selectedPastor.specialties.map((specialty, idx) => (
                            <span key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-white/20">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  );
}