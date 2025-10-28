'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, Calendar, Heart, Building, Video, Globe } from 'lucide-react';

interface ContactForm {
  // Common fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: string;
  formType: string;
  message: string;
  
  // Specific fields
  preferredDate?: string;
  alternateDate?: string;
  partnerName?: string;
  baptismType?: string;
  membershipStatus?: string;
  counselingType?: string;
  volunteerAreas?: string[];
  donationType?: string;
  donationAmount?: string;
  facilityType?: string;
  eventDate?: string;
  guestCount?: string;
  organizationType?: string;
  mediaType?: string;
  sermonDate?: string;
  feedbackType?: string;
  mediaOutlet?: string;
  missionArea?: string;
  sponsorshipType?: string;
  testimonyType?: string;
  isPublic?: boolean;
  urgency?: string;
}

const categories = [
  { id: 'spiritual', name: 'Spiritual & Community Life', icon: Heart, color: 'blue' },
  { id: 'administrative', name: 'Administrative & Facility', icon: Building, color: 'green' },
  { id: 'media', name: 'Media & Communication', icon: Video, color: 'purple' },
  { id: 'outreach', name: 'Outreach & Missions', icon: Globe, color: 'orange' }
];

const formTypes = {
  spiritual: [
    { id: 'baptism', name: 'Baptism / Membership Inquiry' },
    { id: 'counseling', name: 'Counseling / Spiritual Guidance' },
    { id: 'volunteer', name: 'Volunteer / Service Opportunities' }
  ],
  administrative: [
    { id: 'donations', name: 'Donations / Offerings' },
    { id: 'facility', name: 'Facility Booking' },
    { id: 'partnership', name: 'Partnership / Collaboration' }
  ],
  media: [
    { id: 'archive', name: 'Media / Sermon Archive Request' },
    { id: 'feedback', name: 'Website / Social Media Feedback' },
    { id: 'press', name: 'Press / Public Relations' }
  ],
  outreach: [
    { id: 'mission', name: 'Mission Support / Sponsorship' },
    { id: 'testimony', name: 'Testimony Submission' }
  ]
};

export default function EnhancedContactPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFormType, setSelectedFormType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSpecificFields = () => {
    switch (selectedFormType) {
      case 'baptism':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Baptism Type
                </label>
                <select {...register('baptismType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select type</option>
                  <option value="adult">Adult Baptism</option>
                  <option value="infant">Infant Baptism</option>
                  <option value="confirmation">Confirmation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Membership Status
                </label>
                <select {...register('membershipStatus')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select status</option>
                  <option value="new">New to Christianity</option>
                  <option value="transfer">Transferring from another church</option>
                  <option value="returning">Returning member</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Date
              </label>
              <input type="date" {...register('preferredDate')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </>
        );

      case 'counseling':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Counseling Type
              </label>
              <select {...register('counselingType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">Select type</option>
                <option value="spiritual">Spiritual Guidance</option>
                <option value="marriage">Marriage Counseling</option>
                <option value="family">Family Issues</option>
                <option value="grief">Grief Support</option>
                <option value="addiction">Addiction Recovery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level
              </label>
              <select {...register('urgency')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent (within a week)</option>
                <option value="emergency">Emergency (ASAP)</option>
              </select>
            </div>
          </>
        );

      case 'volunteer':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Areas of Interest (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Children Ministry', 'Youth Ministry', 'Music/Worship', 'Hospitality', 'Outreach', 'Administration', 'Maintenance', 'Media/Tech', 'Prayer Team'].map((area) => (
                <label key={area} className="flex items-center">
                  <input type="checkbox" value={area} {...register('volunteerAreas')} className="mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'donations':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Donation Type
                </label>
                <select {...register('donationType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select type</option>
                  <option value="tithe">Tithe</option>
                  <option value="offering">General Offering</option>
                  <option value="building">Building Fund</option>
                  <option value="missions">Missions</option>
                  <option value="special">Special Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Optional)
                </label>
                <input type="number" {...register('donationAmount')} placeholder="$0.00" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </>
        );

      case 'facility':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facility Type
                </label>
                <select {...register('facilityType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select facility</option>
                  <option value="sanctuary">Main Sanctuary</option>
                  <option value="hall">Fellowship Hall</option>
                  <option value="classroom">Classroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="parking">Parking Area</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Guest Count
                </label>
                <input type="number" {...register('guestCount')} placeholder="Number of guests" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Date
              </label>
              <input type="date" {...register('eventDate')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </>
        );

      case 'partnership':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Type
            </label>
            <select {...register('organizationType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Select type</option>
              <option value="church">Another Church</option>
              <option value="ngo">NGO/Non-profit</option>
              <option value="mission">Mission Organization</option>
              <option value="school">Educational Institution</option>
              <option value="business">Business/Corporate</option>
            </select>
          </div>
        );

      case 'archive':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Media Type
                </label>
                <select {...register('mediaType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select type</option>
                  <option value="sermon">Sermon Recording</option>
                  <option value="music">Worship Music</option>
                  <option value="event">Event Recording</option>
                  <option value="study">Bible Study Materials</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specific Date (if known)
                </label>
                <input type="date" {...register('sermonDate')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </>
        );

      case 'feedback':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback Type
            </label>
            <select {...register('feedbackType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Select type</option>
              <option value="bug">Technical Bug Report</option>
              <option value="improvement">Suggestion for Improvement</option>
              <option value="content">Content Update Request</option>
              <option value="accessibility">Accessibility Issue</option>
            </select>
          </div>
        );

      case 'press':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Media Outlet/Organization
            </label>
            <input type="text" {...register('mediaOutlet')} placeholder="Name of media organization" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
        );

      case 'mission':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mission Area
                </label>
                <select {...register('missionArea')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select area</option>
                  <option value="local">Local Community</option>
                  <option value="national">National Missions</option>
                  <option value="international">International Missions</option>
                  <option value="disaster">Disaster Relief</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sponsorship Type
                </label>
                <select {...register('sponsorshipType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select type</option>
                  <option value="financial">Financial Support</option>
                  <option value="volunteer">Volunteer Time</option>
                  <option value="resources">Resources/Materials</option>
                  <option value="prayer">Prayer Support</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'testimony':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Testimony Type
                </label>
                <select {...register('testimonyType')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select type</option>
                  <option value="salvation">Salvation Story</option>
                  <option value="healing">Healing/Miracle</option>
                  <option value="provision">God's Provision</option>
                  <option value="guidance">Divine Guidance</option>
                  <option value="transformation">Life Transformation</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" {...register('isPublic')} className="mr-2" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  I consent to sharing this testimony publicly (website, newsletter, etc.)
                </label>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Message Sent!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for reaching out. We'll get back to you within 24-48 hours.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Contact Us</h1>
            <p className="text-blue-100 mt-2">We're here to help with all your needs</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <label key={category.id} className="relative">
                    <input
                      type="radio"
                      value={category.id}
                      {...register('category', { required: 'Please select a category' })}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedFormType('');
                      }}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedCategory === category.id 
                        ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/20` 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}>
                      <category.icon className={`w-6 h-6 text-${category.color}-500 mb-2`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{category.name}</h3>
                    </div>
                  </label>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Form Type Selection */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Specific Request *
                </label>
                <select
                  {...register('formType', { required: 'Please select a request type' })}
                  onChange={(e) => setSelectedFormType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select request type</option>
                  {formTypes[selectedCategory as keyof typeof formTypes]?.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.formType && <p className="text-red-500 text-sm mt-1">{errors.formType.message}</p>}
              </div>
            )}

            {/* Specific Fields */}
            {selectedFormType && renderSpecificFields()}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Message
              </label>
              <textarea
                {...register('message')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Please provide any additional details..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}