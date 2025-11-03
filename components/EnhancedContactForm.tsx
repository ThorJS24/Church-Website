'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, User, Mail, Phone, MessageSquare, Heart, Users, Calendar, 
  DollarSign, Building, Camera, Megaphone, Globe, 
  BookOpen, Star, Church, Baby
} from 'lucide-react';
import { SecurityManager } from '@/lib/security';
import CountryCodeSelect from '@/components/CountryCodeSelect';

interface FormData {
  formType: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  subject: string;
  message: string;
  urgency: string;
  preferredContact: string;
  ministry?: string;
  availability?: string;
  skills?: string;
  eventType?: string;
  eventDate?: string;
  attendeeCount?: number;
  donationType?: string;
  amount?: number;
  organizationType?: string;
  organizationName?: string;
  mediaType?: string;
}

interface EnhancedContactFormProps {
  type: string;
  title?: string;
  onClose?: () => void;
}

const formConfigs = {
  general: {
    title: 'General Inquiry',
    icon: MessageSquare,
    description: 'Get in touch with us for any questions or information'
  },
  pastoral: {
    title: 'Pastoral Care',
    icon: Heart,
    description: 'Request pastoral support and spiritual care'
  },
  prayer: {
    title: 'Prayer Request',
    icon: Heart,
    description: 'Share your prayer requests with our community'
  },
  baptism: {
    title: 'Baptism / Membership Inquiry',
    icon: Baby,
    description: 'Learn about joining our church family through baptism or membership'
  },
  counseling: {
    title: 'Counseling / Spiritual Guidance',
    icon: Heart,
    description: 'Request one-on-one spiritual counseling and guidance'
  },
  volunteer: {
    title: 'Volunteer / Service Opportunities',
    icon: Users,
    description: 'Join our ministry and make a difference in the community'
  },
  donations: {
    title: 'Donations / Offerings',
    icon: DollarSign,
    description: 'Inquire about giving, tithes, or church fundraisers'
  },
  facility: {
    title: 'Facility Booking',
    icon: Building,
    description: 'Book our facilities for weddings, funerals, or community gatherings'
  },
  partnership: {
    title: 'Partnership / Collaboration',
    icon: Users,
    description: 'Connect with us for ministry partnerships and collaborations'
  },
  media: {
    title: 'Media / Sermon Archive Request',
    icon: Camera,
    description: 'Request sermon recordings or other media materials'
  },
  feedback: {
    title: 'Website / Social Media Feedback',
    icon: Megaphone,
    description: 'Report errors or suggest improvements to our digital presence'
  },
  press: {
    title: 'Press / Public Relations',
    icon: Globe,
    description: 'Media requests and public relations inquiries'
  },
  mission: {
    title: 'Mission Support / Sponsorship',
    icon: Globe,
    description: 'Support our outreach projects and mission work'
  },
  testimony: {
    title: 'Testimony Submission',
    icon: Star,
    description: 'Share how God has worked in your life'
  }
};

export default function EnhancedContactForm({ type, title, onClose }: EnhancedContactFormProps) {
  const config = formConfigs[type as keyof typeof formConfigs] || formConfigs.general;
  const IconComponent = config.icon;

  const [formData, setFormData] = useState<FormData>({
    formType: type,
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    subject: '',
    message: '',
    urgency: 'normal',
    preferredContact: 'email'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!SecurityManager.validateInput(formData.name) || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!SecurityManager.validateEmail(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!SecurityManager.validateInput(formData.message) || !formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (formData.phone && !SecurityManager.validateInput(formData.phone)) {
      newErrors.phone = 'Phone number contains invalid characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const sanitizedData = {
        ...formData,
        name: SecurityManager.sanitizeInput(formData.name),
        email: SecurityManager.sanitizeInput(formData.email),
        phone: SecurityManager.sanitizeInput(formData.phone || ''),
        subject: SecurityManager.sanitizeInput(formData.subject || ''),
        message: SecurityManager.sanitizeInput(formData.message),
        submittedAt: new Date().toISOString(),
        ip: await fetch('/api/get-ip').then(res => res.json()).then(data => data.ip)
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setErrors({ submit: 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: typeof value === 'string' ? SecurityManager.sanitizeInput(value) : value });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
          Message Sent Successfully!
        </h3>
        <p className="text-green-600 dark:text-green-300 mb-4">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Another Message
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title || config.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{config.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <CountryCodeSelect 
                value={formData.countryCode || '+91'}
                onChange={(code) => setFormData({...formData, countryCode: code})}
              />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </div>
        </div>

        {/* Type-specific fields */}
        {type === 'volunteer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ministry Interest
              </label>
              <select
                value={formData.ministry || ''}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a ministry</option>
                <option value="worship">Worship Team</option>
                <option value="children">Children's Ministry</option>
                <option value="youth">Youth Ministry</option>
                <option value="outreach">Community Outreach</option>
                <option value="hospitality">Hospitality</option>
                <option value="tech">Technical Support</option>
                <option value="prayer">Prayer Ministry</option>
                <option value="music">Music Ministry</option>
                <option value="teaching">Teaching/Education</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <input
                type="text"
                value={formData.availability || ''}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Weekends, Evenings"
              />
            </div>
          </div>
        )}

        {type === 'facility' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={formData.eventType || ''}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select event type</option>
                <option value="wedding">Wedding</option>
                <option value="funeral">Funeral</option>
                <option value="community">Community Gathering</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Date
              </label>
              <input
                type="datetime-local"
                value={formData.eventDate || ''}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Attendees
              </label>
              <input
                type="number"
                value={formData.attendeeCount || ''}
                onChange={(e) => handleInputChange('attendeeCount', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Number of attendees"
              />
            </div>
          </div>
        )}

        {type === 'donations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Donation Type
              </label>
              <select
                value={formData.donationType || ''}
                onChange={(e) => setFormData({ ...formData, donationType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select donation type</option>
                <option value="general">General Offering</option>
                <option value="building">Building Fund</option>
                <option value="mission">Mission Support</option>
                <option value="project">Special Project</option>
                <option value="memorial">Memorial Gift</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (Optional)
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Amount in INR"
              />
            </div>
          </div>
        )}

        {type === 'partnership' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Type
              </label>
              <select
                value={formData.organizationType || ''}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select organization type</option>
                <option value="church">Church</option>
                <option value="ngo">NGO</option>
                <option value="mission">Mission Organization</option>
                <option value="community">Community Group</option>
                <option value="education">Educational Institution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.organizationName || ''}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your organization name"
              />
            </div>
          </div>
        )}

        {type === 'media' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Media Type Requested
            </label>
            <select
              value={formData.mediaType || ''}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select media type</option>
              <option value="audio">Sermon Audio</option>
              <option value="video">Sermon Video</option>
              <option value="written">Written Materials</option>
              <option value="photos">Photos</option>
              <option value="livestream">Live Stream Access</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject || ''}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Brief subject line"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            required
            rows={6}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder={`Share your ${type === 'prayer' ? 'prayer request' : type === 'testimony' ? 'testimony' : 'message'}...`}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        {(type === 'prayer' || type === 'pastoral' || type === 'counseling') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urgency Level
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-lg flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Sending...' : 'Send Message'}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}