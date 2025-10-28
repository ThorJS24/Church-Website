'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Phone, Mail, Tag, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface EventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderDescription = (description: any) => {
    if (typeof description === 'string') return description;
    if (Array.isArray(description)) {
      return description.map((block: any) => {
        if (block._type === 'block') {
          return block.children?.map((child: any) => child.text).join('') || '';
        }
        return '';
      }).join('\n');
    }
    return 'No description available';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-black bg-opacity-30"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl relative z-50"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {event.image?.asset?.url && (
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <Image
                        src={event.image.asset.url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-5 h-5 mr-3" />
                      <div>
                        <p className="font-medium">{formatDate(event.startDate)}</p>
                        {event.endDate && (
                          <p className="text-sm">Until {formatDate(event.endDate)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="w-5 h-5 mr-3" />
                      <div>
                        <p>{formatTime(event.startDate)}</p>
                        {event.endDate && (
                          <p className="text-sm">- {formatTime(event.endDate)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-5 h-5 mr-3" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                        {event.address && (
                          <p className="text-sm">{event.address}</p>
                        )}
                      </div>
                    </div>

                    {event.category && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Tag className="w-5 h-5 mr-3" />
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                          {event.category.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                        </span>
                      </div>
                    )}

                    {event.cost !== undefined && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <DollarSign className="w-5 h-5 mr-3" />
                        <span className="font-medium">
                          {event.cost === 0 ? 'Free' : `$${event.cost}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {event.shortDescription || renderDescription(event.description)}
                    </div>
                  </div>

                  {(event.organizer || event.contactEmail || event.contactPhone) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        {event.organizer?.name && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <User className="w-4 h-4 mr-2" />
                            <span>{event.organizer.name}</span>
                          </div>
                        )}
                        {event.contactEmail && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Mail className="w-4 h-4 mr-2" />
                            <a href={`mailto:${event.contactEmail}`} className="hover:text-blue-600">
                              {event.contactEmail}
                            </a>
                          </div>
                        )}
                        {event.contactPhone && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Phone className="w-4 h-4 mr-2" />
                            <a href={`tel:${event.contactPhone}`} className="hover:text-blue-600">
                              {event.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.registrationRequired && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Registration Required
                      </h3>
                      {event.maxAttendees && (
                        <p className="text-blue-700 dark:text-blue-200 text-sm mb-2">
                          Limited to {event.maxAttendees} attendees
                        </p>
                      )}
                      {event.registrationUrl ? (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Register Now
                        </a>
                      ) : (
                        <p className="text-blue-700 dark:text-blue-200 text-sm">
                          Contact us for registration details
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}