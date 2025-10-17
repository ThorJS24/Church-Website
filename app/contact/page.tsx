'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare, Calendar, Navigation } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface SiteSettings {
  churchName: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface StaffMember {
  _id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

const departments = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'pastoral', label: 'Pastoral Care' },
  { value: 'ministries', label: 'Ministries' },
  { value: 'events', label: 'Events' },
  { value: 'prayer', label: 'Prayer Request' },
  { value: 'technical', label: 'Technical Support' }
];

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'general',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [siteSettingsData, staffData] = await Promise.all([
        sanityFetch(`*[_type == "siteSettings"][0] {
          churchName,
          address,
          phoneNumber,
          email
        }`),
        sanityFetch(`*[_type == "staffMember"] {
          _id,
          name,
          position,
          email,
          phone
        }`)
      ]);

      if (siteSettingsData) setSiteSettings(siteSettingsData);
      if (staffData) setStaff(staffData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'general',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: [siteSettings?.address || 'Address not available']
    },
    {
      icon: Phone,
      title: 'Phone',
      details: [siteSettings?.phoneNumber || 'Phone not available']
    },
    {
      icon: Mail,
      title: 'Email',
      details: [siteSettings?.email || 'Email not available']
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Monday - Friday: 9:00 AM - 5:00 PM', 'Saturday: 10:00 AM - 2:00 PM', 'Sunday: After Service']
    }
  ];

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
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We'd love to hear from you. Get in touch with our church family.
          </motion.p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Please share your message with us..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </button>
                  
                  {submitStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">Thank you for your message! We'll get back to you soon.</p>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                  <p className="text-gray-600 mb-8">
                    Whether you're looking for information about our services, want to get involved, 
                    or need prayer, we're here for you. Don't hesitate to reach out!
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={info.title} className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <info.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      Schedule a Meeting
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                      Submit Prayer Request
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      {staff.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Staff</h2>
              <p className="text-gray-600">Meet our dedicated team who are here to serve you</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {staff.map((member, index) => (
                <motion.div 
                  key={member._id}
                  className="text-center bg-gray-50 p-6 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                  <div className="space-y-2 text-sm">
                    {member.email && (
                      <div className="flex items-center justify-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center justify-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${member.phone}`} className="hover:text-blue-600">
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Find Us</h2>
            <p className="text-gray-600">Visit us at our location</p>
          </div>
          
          <motion.div 
            className="bg-gray-300 h-96 rounded-lg flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Interactive Map</p>
              <p className="text-gray-500">{siteSettings?.address}</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Open in Google Maps
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}