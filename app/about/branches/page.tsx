'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Phone, Mail, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';
import DivineEffects from '@/components/DivineEffects';
import SacredText from '@/components/SacredText';
import HeavenlyCard from '@/components/HeavenlyCard';

interface Branch {
  _id: string;
  name: string;
  description: string;
  established: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    googleMapsUrl?: string;
  };
  pastors?: Array<{
    name: string;
    title?: string;
    image?: {
      asset: {
        url: string;
      };
    };
  }>;
  contact: {
    phone?: string;
    email?: string;
  };
  images: Array<{
    asset: {
      asset: {
        _ref: string;
      };
    };
    alt?: string;
  }>;
  services: Array<{
    day: string;
    time: string;
    type: string;
  }>;
  memberCount?: number;
  parentBranch?: string;
  isMainChurch?: boolean;
}

interface BranchesData {
  title: string;
  subtitle: string;
  branches: Branch[];
}

export default function BranchesPage() {
  const [branchesData, setBranchesData] = useState<BranchesData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);



  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await sanityFetch(`*[_type == "branchesPage"][0] {
        title,
        subtitle,
        branches[] {
          _id,
          name,
          description,
          established,
          location {
            address,
            coordinates {
              lat,
              lng
            },
            googleMapsUrl
          },
          pastors[]-> {
            name,
            title,
            image {
              asset-> {
                url
              }
            }
          },
          contact {
            phone,
            email
          },
          images[] {
            asset,
            alt
          },
          services[] {
            day,
            time,
            type
          },
          memberCount,
          parentBranch,
          isMainChurch
        }
      }`);
      if (data) {
        console.log('Branches data:', data);
        setBranchesData(data);
        

      }
    } catch (error) {
      console.error('Error fetching branches data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (selectedBranch?.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedBranch.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedBranch?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedBranch.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading branches...</p>
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
              {branchesData?.title || "Our Branches"}
            </motion.h1>
          </SacredText>
          <motion.p
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {branchesData?.subtitle || "Spreading God's love across communities"}
          </motion.p>
        </div>
      </section>

      {/* Branch Cards */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <SacredText size="xl" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              <h2>Our Branches</h2>
            </SacredText>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our church locations and connect with communities spreading God's love
            </p>
          </div>
          
          {/* Branch Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {branchesData?.branches?.map((branch, index) => (
              <motion.div
                key={branch._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <HeavenlyCard className="h-full hover:shadow-xl transition-all duration-300 group">
                  {/* Branch Image */}
                  <div className="relative h-48 rounded-t-lg overflow-hidden">
                    {branch.images?.[0]?.asset?.asset?._ref ? (
                      <img
                        src={`https://cdn.sanity.io/images/jon2drzn/production/${branch.images[0].asset.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}?w=400&h=300&fit=crop&crop=center`}
                        alt={branch.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-blue-500 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                        Est. {branch.established}
                      </div>
                    </div>
                  </div>
                  
                  {/* Branch Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {branch.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {branch.description}
                    </p>
                    
                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <span className="truncate">{branch.location.address}</span>
                      </div>
                      {branch.memberCount && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Users className="w-4 h-4 mr-2 text-purple-600" />
                          <span>{branch.memberCount} Members</span>
                        </div>
                      )}
                      {branch.contact.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{branch.contact.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Learn More Button */}
                    <motion.button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setCurrentImageIndex(0);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </div>
                </HeavenlyCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Branch Detail Modal */}
      <AnimatePresence>
        {selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBranch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedBranch.name}
                </h2>
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image Gallery */}
                {selectedBranch.images && selectedBranch.images.length > 0 && (
                  <div className="relative mb-6">
                    <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-gray-200">
                      {selectedBranch.images[currentImageIndex]?.asset?.asset?._ref ? (
                        <img
                          src={`https://cdn.sanity.io/images/jon2drzn/production/${selectedBranch.images[currentImageIndex].asset.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}?w=800&h=450&fit=crop&crop=center`}
                          alt={selectedBranch.images[currentImageIndex].alt || selectedBranch.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Image failed to load:', selectedBranch.images[currentImageIndex].asset.asset._ref);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                          <div>No image available</div>
                          <div className="mt-2 text-xs">
                            Debug: {JSON.stringify(selectedBranch.images[currentImageIndex])}
                          </div>
                        </div>
                      )}
                      {selectedBranch.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {selectedBranch.images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Branch Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedBranch.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Established: {selectedBranch.established}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {selectedBranch.location.address}
                        </span>
                      </div>
                      {selectedBranch.memberCount && (
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-3 text-purple-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedBranch.memberCount} Members
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Contact & Services</h3>
                    
                    {/* Pastors Info */}
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pastors:</h4>
                      {selectedBranch.pastors && selectedBranch.pastors.length > 0 ? (
                        selectedBranch.pastors.map((pastor, index) => (
                          <div key={index} className="flex items-center mb-2">
                            {pastor.image?.asset && (
                              <img
                                src={`${pastor.image.asset.url}?w=40&h=40&fit=crop`}
                                alt={pastor.name}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            )}
                            <button
                              onClick={() => {
                                const pastorName = pastor.name?.toLowerCase().replace(/\s+/g, '-');
                                window.location.href = `/about/pastors${pastorName ? `#${pastorName}` : ''}`;
                              }}
                              className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                            >
                              {pastor.name} {pastor.title && `(${pastor.title})`}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-sm">No pastors assigned</div>
                      )}
                      {selectedBranch.contact.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-300">{selectedBranch.contact.phone}</span>
                        </div>
                      )}
                      {selectedBranch.contact.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-300">{selectedBranch.contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    {selectedBranch.services && selectedBranch.services.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Service Times:</h4>
                        <div className="space-y-1">
                          {selectedBranch.services.map((service, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">{service.day}</span> - {service.time} ({service.type})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Embedded Map */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Location</h3>
                  <div className="h-64 rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src={`https://maps.google.com/maps?q=${selectedBranch.location.coordinates.lat},${selectedBranch.location.coordinates.lng}&hl=en&z=16&t=k&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedBranch.location.address}
                    </p>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedBranch.location.address)}`;
                        window.open(url, '_blank');
                      }}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}