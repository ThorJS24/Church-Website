'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare, Calendar, Navigation, MessageCircle, ChevronRight, ChevronLeft, Heart, Users, Building, Video, Globe } from 'lucide-react';
import { sanityFetch } from '@/lib/sanity-fetch';

interface SiteSettings {
  churchName: string;
  address: string;
  phoneNumber: string;
  email: string;
  whatsappGroupUrl?: string;
}

interface StaffMember {
  _id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
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
    { id: 'volunteer', name: 'Volunteer / Service Opportunities' },
    { id: 'prayer', name: 'Prayer Request' }
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

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [officeHours, setOfficeHours] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    preferredContact: 'email',
    // Step 2: Category & Type
    category: '',
    formType: '',
    // Step 3: Details & Message
    subject: '',
    message: '',
    urgency: 'normal',
    preferredDate: '',
    alternateDate: '',
    // Baptism fields
    baptismType: '',
    membershipStatus: '',
    previousChurch: '',
    baptismDate: '',
    // Counseling fields
    counselingType: '',
    sessionType: '',
    availableTimes: [] as string[],
    // Volunteer fields
    volunteerAreas: [] as string[],
    availability: '',
    skills: '',
    experience: '',
    backgroundCheck: false,
    // Donation fields
    donationType: '',
    donationAmount: '',
    isRecurring: false,
    frequency: '',
    // Facility fields
    facilityType: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    setupRequirements: '',
    cateringNeeded: false,
    // Partnership fields
    organizationType: '',
    organizationName: '',
    contactPerson: '',
    partnershipType: '',
    // Media fields
    mediaType: '',
    specificDate: '',
    format: '',
    // Feedback fields
    feedbackType: '',
    pageUrl: '',
    deviceType: '',
    // Press fields
    mediaOutlet: '',
    deadline: '',
    interviewType: '',
    // Mission fields
    missionArea: '',
    sponsorshipType: '',
    commitmentLevel: '',
    // Testimony fields
    testimonyType: '',
    isPublic: false,
    anonymousSubmission: false,
    // Prayer fields
    prayerCategory: '',
    isConfidential: false,
    followUpNeeded: false
  });
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [siteSettingsData, staffData, officeHoursData] = await Promise.all([
        sanityFetch(`*[_type == "siteSettings"][0] {
          churchName,
          address,
          phoneNumber,
          email,
          whatsappGroupUrl,
          officeHours
        }`),
        sanityFetch(`*[_type == "staffMember"] {
          _id,
          name,
          position,
          email,
          phone
        }`),
        sanityFetch(`*[_type == "siteSettings"][0].officeHours`)
      ]);

      if (siteSettingsData) setSiteSettings(siteSettingsData);
      if (staffData) setStaff(staffData);
      if (officeHoursData) setOfficeHours(officeHoursData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus('success');
        setCurrentStep(1);
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
          dateOfBirth: '', gender: '', maritalStatus: '', occupation: '', preferredContact: 'email',
          category: '', formType: '', subject: '', message: '', urgency: 'normal', preferredDate: '', alternateDate: '',
          baptismType: '', membershipStatus: '', previousChurch: '', baptismDate: '', counselingType: '', sessionType: '', availableTimes: [],
          volunteerAreas: [], availability: '', skills: '', experience: '', backgroundCheck: false,
          donationType: '', donationAmount: '', isRecurring: false, frequency: '',
          facilityType: '', eventDate: '', eventTime: '', guestCount: '', setupRequirements: '', cateringNeeded: false,
          organizationType: '', organizationName: '', contactPerson: '', partnershipType: '',
          mediaType: '', specificDate: '', format: '', feedbackType: '', pageUrl: '', deviceType: '',
          mediaOutlet: '', deadline: '', interviewType: '', missionArea: '', sponsorshipType: '', commitmentLevel: '',
          testimonyType: '', isPublic: false, anonymousSubmission: false, prayerCategory: '', isConfidential: false, followUpNeeded: false
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const canProceedStep1 = formData.firstName && formData.lastName && formData.email;
  const canProceedStep2 = formData.category && formData.formType;



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading contact information...</p>
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
      details: officeHours.length > 0 ? officeHours : ['Contact us for availability']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            We&apos;d love to hear from you. Get in touch with our church family.
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
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Send us a Message</h2>
                
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="relative flex items-center justify-between mb-4">
                    <div className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 ${
                      currentStep >= 3 ? 'bg-blue-600' : currentStep >= 2 ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-gray-200' : 'bg-gradient-to-r from-blue-600 to-gray-200'
                    }`} />
                    {[1, 2, 3].map((step) => (
                      <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep} of 3: {currentStep === 1 ? 'Personal Information' : currentStep === 2 ? 'Category Selection' : 'Details & Message'}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Street address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Marital Status
                          </label>
                          <select
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Occupation
                          </label>
                          <input
                            type="text"
                            value={formData.occupation}
                            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Contact Method
                          </label>
                          <select
                            value={formData.preferredContact}
                            onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="either">Either</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Category Selection */}
                  {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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
                                checked={formData.category === category.id}
                                onChange={(e) => {
                                  setFormData({...formData, category: e.target.value, formType: ''});
                                }}
                                className="sr-only"
                              />
                              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.category === category.id 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                              }`}>
                                <category.icon className="w-6 h-6 text-blue-500 mb-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{category.name}</h3>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.category && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Specific Request *
                          </label>
                          <select
                            value={formData.formType}
                            onChange={(e) => setFormData({...formData, formType: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select request type</option>
                            {formTypes[formData.category as keyof typeof formTypes]?.map((type) => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Details & Message */}
                  {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      {/* Type-specific fields */}
                      {formData.formType === 'baptism' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Baptism Type
                            </label>
                            <select value={formData.baptismType} onChange={(e) => setFormData({...formData, baptismType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                              <option value="">Select type</option>
                              <option value="adult">Adult Baptism</option>
                              <option value="infant">Infant Baptism</option>
                              <option value="confirmation">Confirmation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Membership Status
                            </label>
                            <select value={formData.membershipStatus} onChange={(e) => setFormData({...formData, membershipStatus: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                              <option value="">Select status</option>
                              <option value="new">New to Christianity</option>
                              <option value="transfer">Transferring from another church</option>
                              <option value="returning">Returning member</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {formData.formType === 'volunteer' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Areas of Interest
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Children Ministry', 'Youth Ministry', 'Music/Worship', 'Hospitality', 'Outreach', 'Administration'].map((area) => (
                              <label key={area} className="flex items-center">
                                <input type="checkbox" checked={formData.volunteerAreas.includes(area)} onChange={(e) => {
                                  const areas = e.target.checked 
                                    ? [...formData.volunteerAreas, area]
                                    : formData.volunteerAreas.filter(a => a !== area);
                                  setFormData({...formData, volunteerAreas: areas});
                                }} className="mr-2" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.formType === 'donations' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Donation Type
                            </label>
                            <select value={formData.donationType} onChange={(e) => setFormData({...formData, donationType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                              <option value="">Select type</option>
                              <option value="tithe">Tithe</option>
                              <option value="offering">General Offering</option>
                              <option value="building">Building Fund</option>
                              <option value="missions">Missions</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Amount (Optional)
                            </label>
                            <input type="number" value={formData.donationAmount} onChange={(e) => setFormData({...formData, donationAmount: e.target.value})} placeholder="₹0.00" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                          </div>
                        </div>
                      )}

                      {formData.formType === 'facility' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Facility Type
                            </label>
                            <select value={formData.facilityType} onChange={(e) => setFormData({...formData, facilityType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                              <option value="">Select facility</option>
                              <option value="sanctuary">Main Sanctuary</option>
                              <option value="hall">Fellowship Hall</option>
                              <option value="classroom">Classroom</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Event Date
                            </label>
                            <input type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Guest Count
                            </label>
                            <input type="number" value={formData.guestCount} onChange={(e) => setFormData({...formData, guestCount: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message *
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {(formData.formType === 'prayer' || formData.formType === 'counseling') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Urgency Level
                          </label>
                          <select value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </button>
                    )}
                    
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </button>
                    )}
                  </div>
                  
                  {submitStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">Thank you for your message! We&apos;ll get back to you soon.</p>
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
                    Whether you&apos;re looking for information about our services, want to get involved, 
                    or need prayer, we&apos;re here for you. Don&apos;t hesitate to reach out!
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

                    <button 
                      onClick={() => {
                        setCurrentStep(2);
                        setFormData({...formData, category: 'spiritual', formType: 'counseling'});
                      }}
                      className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      Schedule a Meeting
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentStep(2);
                        setFormData({...formData, category: 'spiritual', formType: 'prayer'});
                      }}
                      className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                      Submit Prayer Request
                    </button>
                    <a 
                      href="https://www.google.com/maps/dir//SALEM+PRIMITIVE+BAPTIST+CHURCH,+Salem,+Tamil+Nadu/@11.678130577350974,78.16560039927737,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3babf16da41b56e5:0x30049390bc14cac1!2m2!1d78.16560039927737!2d11.678130577350974"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                      Get Directions
                    </a>
                    {siteSettings?.whatsappGroupUrl && (
                      <a href={siteSettings.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                        </svg>
                        Join WhatsApp Group
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      {staff.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Staff</h2>
              <p className="text-gray-600 dark:text-gray-300">Meet our dedicated team who are here to serve you</p>
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
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Find Us</h2>
            <p className="text-gray-600 dark:text-gray-300">Visit us at our location</p>
          </div>
          
          <motion.div 
            className="h-96 rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d289.6717292106369!2d78.16560039927737!3d11.678130577350974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf16da41b56e5%3A0x30049390bc14cac1!2sSALEM%20PRIMITIVE%20BAPTIST%20CHURCH!5e1!3m2!1sen!2sin!4v1760932034062!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}