'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import { SecurityManager } from '@/lib/security';
import CountryCodeSelect from '@/components/CountryCodeSelect';

const formTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'pastoral', label: 'Pastoral Care' },
  { value: 'prayer', label: 'Prayer Request' },
  { value: 'baptism', label: 'Baptism / Membership' },
  { value: 'counseling', label: 'Counseling / Spiritual Guidance' },
  { value: 'volunteer', label: 'Volunteer Opportunities' },
  { value: 'donations', label: 'Donations / Offerings' },
  { value: 'facility', label: 'Facility Booking' },
  { value: 'partnership', label: 'Partnership / Collaboration' },
  { value: 'media', label: 'Media / Sermon Archive' },
  { value: 'feedback', label: 'Website Feedback' },
  { value: 'press', label: 'Press / Public Relations' },
  { value: 'mission', label: 'Mission Support' },
  { value: 'testimony', label: 'Testimony Submission' }
];

export default function UnifiedContactForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', countryCode: '+91', address: '', age: '', gender: '', formType: '', subject: '', message: '', urgency: 'normal',
    baptismType: '', membershipStatus: '', previousChurch: '', baptismDate: '', salvationDate: '',
    counselingType: '', previousCounseling: '', sessionPreference: '', emergencyContact: '', mentalHealthHistory: '',
    preferredMinistry: '', timeCommitment: '', volunteerExperience: '', availability: '', skills: '', backgroundCheck: false,
    eventType: '', eventDate: '', attendeeCount: '', setupRequirements: '', cateringNeeds: '',
    donationType: '', amount: '', frequency: '', anonymous: false,
    organizationType: '', organizationName: '', partnershipType: '',
    mediaType: '', specificContent: '', usagePurpose: '',
    prayerCategory: '', shareWithChurch: false,
    preferredContactTime: '', privacyConsent: false, informationAccuracy: false,
    // Additional fields
    maritalStatus: '', occupation: '', referralSource: '', followUpPreference: '',
    specialNeeds: '', languagePreference: '', bestTimeToCall: '', alternateContact: '',
    churchAttendance: '', spiritualBackground: '', specificPastor: '', urgentCallback: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!SecurityManager.validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.formType) newErrors.formType = 'Please select a form type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    if (formData.formType === 'baptism' && !formData.baptismType) {
      newErrors.baptismType = 'Baptism type is required';
    }
    if (formData.formType === 'facility') {
      if (!formData.eventType) newErrors.eventType = 'Event type is required';
      if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    }
    if (formData.formType === 'volunteer' && !formData.preferredMinistry) {
      newErrors.preferredMinistry = 'Preferred ministry is required';
    }
    if (formData.formType === 'donations' && !formData.donationType) {
      newErrors.donationType = 'Donation type is required';
    }
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'Privacy consent is required';
    }
    if (!formData.informationAccuracy) {
      newErrors.informationAccuracy = 'Information accuracy confirmation is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/contact/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          ip: await fetch('/api/get-ip').then(res => res.json()).then(data => data.ip)
        })
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center max-w-2xl mx-auto"
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
        <button
          onClick={() => { 
            setSubmitted(false); 
            setStep(1); 
            setFormData({ 
              name: '', email: '', phone: '', countryCode: '+91', address: '', age: '', gender: '', formType: '', subject: '', message: '', urgency: 'normal',
              baptismType: '', membershipStatus: '', previousChurch: '', baptismDate: '', salvationDate: '',
              counselingType: '', previousCounseling: '', sessionPreference: '', emergencyContact: '', mentalHealthHistory: '',
              preferredMinistry: '', timeCommitment: '', volunteerExperience: '', availability: '', skills: '', backgroundCheck: false,
              eventType: '', eventDate: '', attendeeCount: '', setupRequirements: '', cateringNeeds: '',
              donationType: '', amount: '', frequency: '', anonymous: false,
              organizationType: '', organizationName: '', partnershipType: '',
              mediaType: '', specificContent: '', usagePurpose: '',
              prayerCategory: '', shareWithChurch: false,
              preferredContactTime: '', privacyConsent: false, informationAccuracy: false,
              maritalStatus: '', occupation: '', referralSource: '', followUpPreference: '',
              specialNeeds: '', languagePreference: '', bestTimeToCall: '', alternateContact: '',
              churchAttendance: '', spiritualBackground: '', specificPastor: '', urgentCallback: false
            }); 
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">Basic Info</span>
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">Form Type</span>
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">Details & Message</span>
          </div>
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300">Let's start with your basic information</p>
            </div>

            <div className="space-y-6">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="flex">
                  <CountryCodeSelect 
                    value={formData.countryCode}
                    onChange={(code) => setFormData({...formData, countryCode: code})}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Your address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Time (Optional)
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => setFormData({ ...formData, preferredContactTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select preferred time...</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marital Status (Optional)
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select status...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your occupation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How did you hear about us? (Optional)
                  </label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select source...</option>
                    <option value="friend">Friend/Family</option>
                    <option value="website">Website</option>
                    <option value="social-media">Social Media</option>
                    <option value="google">Google Search</option>
                    <option value="drive-by">Drove by church</option>
                    <option value="event">Church event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Church Attendance (Optional)
                  </label>
                  <select
                    value={formData.churchAttendance}
                    onChange={(e) => setFormData({ ...formData, churchAttendance: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select attendance...</option>
                    <option value="first-time">First time visitor</option>
                    <option value="occasional">Occasional visitor</option>
                    <option value="regular">Regular attendee</option>
                    <option value="member">Church member</option>
                    <option value="online-only">Online only</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg"
              >
                Next Step
              </button>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What can we help you with?</h2>
              <p className="text-gray-600 dark:text-gray-300">Select the type of inquiry</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Inquiry *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.formType}
                    onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="">Select inquiry type...</option>
                    {formTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
                {errors.formType && <p className="mt-1 text-sm text-red-600">{errors.formType}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                >
                  Next Step
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Additional Details</h2>
              <p className="text-gray-600 dark:text-gray-300">Please provide specific information for your {formTypes.find(t => t.value === formData.formType)?.label}</p>
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-6">
              {formData.formType === 'baptism' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type of Request *
                    </label>
                    <select
                      required
                      value={formData.baptismType}
                      onChange={(e) => setFormData({ ...formData, baptismType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type...</option>
                      <option value="baptism">Baptism</option>
                      <option value="membership">Membership</option>
                      <option value="both">Both Baptism & Membership</option>
                    </select>
                    {errors.baptismType && <p className="mt-1 text-sm text-red-600">{errors.baptismType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Membership Status
                    </label>
                    <select
                      value={formData.membershipStatus}
                      onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select status...</option>
                      <option value="new">New to Christianity</option>
                      <option value="transfer">Transferring from another church</option>
                      <option value="returning">Returning member</option>
                      <option value="visitor">Regular visitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Previous Church (if transferring)
                    </label>
                    <input
                      type="text"
                      value={formData.previousChurch}
                      onChange={(e) => setFormData({ ...formData, previousChurch: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Name of previous church"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salvation Date (if known)
                      </label>
                      <input
                        type="date"
                        value={formData.salvationDate}
                        onChange={(e) => setFormData({ ...formData, salvationDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Previous Baptism Date (if applicable)
                      </label>
                      <input
                        type="date"
                        value={formData.baptismDate}
                        onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.formType === 'counseling' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type of Counseling
                    </label>
                    <select
                      value={formData.counselingType}
                      onChange={(e) => setFormData({ ...formData, counselingType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type...</option>
                      <option value="individual">Individual Counseling</option>
                      <option value="couples">Couples Counseling</option>
                      <option value="family">Family Counseling</option>
                      <option value="grief">Grief Counseling</option>
                      <option value="spiritual">Spiritual Direction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Previous Counseling Experience
                    </label>
                    <select
                      value={formData.previousCounseling}
                      onChange={(e) => setFormData({ ...formData, previousCounseling: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select...</option>
                      <option value="none">No previous counseling</option>
                      <option value="some">Some previous counseling</option>
                      <option value="extensive">Extensive counseling experience</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Preference
                    </label>
                    <select
                      value={formData.sessionPreference}
                      onChange={(e) => setFormData({ ...formData, sessionPreference: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select preference...</option>
                      <option value="in-person">In-person</option>
                      <option value="phone">Phone call</option>
                      <option value="video">Video call</option>
                      <option value="no-preference">No preference</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency Contact Name & Phone
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Name and phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mental Health History (Optional - Confidential)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.mentalHealthHistory}
                      onChange={(e) => setFormData({ ...formData, mentalHealthHistory: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Any relevant mental health information that might help us serve you better..."
                    />
                  </div>
                </>
              )}

              {formData.formType === 'volunteer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Ministry *
                    </label>
                    <select
                      required
                      value={formData.preferredMinistry}
                      onChange={(e) => setFormData({ ...formData, preferredMinistry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select ministry...</option>
                      <option value="worship">Worship Team</option>
                      <option value="children">Children's Ministry</option>
                      <option value="youth">Youth Ministry</option>
                      <option value="outreach">Community Outreach</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="tech">Technical Support</option>
                      <option value="prayer">Prayer Ministry</option>
                      <option value="teaching">Teaching/Education</option>
                    </select>
                    {errors.preferredMinistry && <p className="mt-1 text-sm text-red-600">{errors.preferredMinistry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Commitment
                    </label>
                    <select
                      value={formData.timeCommitment}
                      onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select commitment...</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="occasional">Occasional/As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Volunteer Experience
                    </label>
                    <textarea
                      rows={3}
                      value={formData.volunteerExperience}
                      onChange={(e) => setFormData({ ...formData, volunteerExperience: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Describe any relevant experience or skills..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Availability Details
                    </label>
                    <textarea
                      rows={2}
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Specific days/times you're available..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Special Skills/Talents
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Music, Teaching, Carpentry, etc."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="backgroundCheck"
                      checked={formData.backgroundCheck}
                      onChange={(e) => setFormData({ ...formData, backgroundCheck: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="backgroundCheck" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I consent to a background check if required for this ministry
                    </label>
                  </div>
                </>
              )}

              {formData.formType === 'facility' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type *
                    </label>
                    <select
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select event type...</option>
                      <option value="wedding">Wedding</option>
                      <option value="funeral">Funeral</option>
                      <option value="community">Community Gathering</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                    </select>
                    {errors.eventType && <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {errors.eventDate && <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Attendees
                      </label>
                      <input
                        type="number"
                        value={formData.attendeeCount}
                        onChange={(e) => setFormData({ ...formData, attendeeCount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Number of attendees"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Setup Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={formData.setupRequirements}
                      onChange={(e) => setFormData({ ...formData, setupRequirements: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Describe any special setup needs (tables, chairs, AV equipment, etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catering/Refreshment Needs
                    </label>
                    <select
                      value={formData.cateringNeeds}
                      onChange={(e) => setFormData({ ...formData, cateringNeeds: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select catering needs...</option>
                      <option value="none">No catering needed</option>
                      <option value="light">Light refreshments</option>
                      <option value="full-meal">Full meal</option>
                      <option value="external">External catering</option>
                    </select>
                  </div>
                </>
              )}

              {formData.formType === 'donations' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Donation Type *
                    </label>
                    <select
                      required
                      value={formData.donationType}
                      onChange={(e) => setFormData({ ...formData, donationType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select donation type...</option>
                      <option value="general">General Offering</option>
                      <option value="building">Building Fund</option>
                      <option value="mission">Mission Support</option>
                      <option value="project">Special Project</option>
                      <option value="memorial">Memorial Gift</option>
                    </select>
                    {errors.donationType && <p className="mt-1 text-sm text-red-600">{errors.donationType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Amount in INR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Donation Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select frequency...</option>
                      <option value="one-time">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.anonymous}
                      onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I prefer to remain anonymous
                    </label>
                  </div>
                </>
              )}

              {formData.formType === 'partnership' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Type
                    </label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select organization type...</option>
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
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Partnership Type
                    </label>
                    <select
                      value={formData.partnershipType}
                      onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select partnership type...</option>
                      <option value="mission">Mission Partnership</option>
                      <option value="event">Event Collaboration</option>
                      <option value="resource">Resource Sharing</option>
                      <option value="ministry">Ministry Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {formData.formType === 'media' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Media Type Requested
                    </label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select media type...</option>
                      <option value="audio">Sermon Audio</option>
                      <option value="video">Sermon Video</option>
                      <option value="written">Written Materials</option>
                      <option value="photos">Photos</option>
                      <option value="livestream">Live Stream Access</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specific Content/Date
                    </label>
                    <input
                      type="text"
                      value={formData.specificContent}
                      onChange={(e) => setFormData({ ...formData, specificContent: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Specific sermon date or event name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Usage Purpose
                    </label>
                    <textarea
                      rows={2}
                      value={formData.usagePurpose}
                      onChange={(e) => setFormData({ ...formData, usagePurpose: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="How will you use this media content?"
                    />
                  </div>
                </>
              )}

              {formData.formType === 'prayer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prayer Category
                    </label>
                    <select
                      value={formData.prayerCategory}
                      onChange={(e) => setFormData({ ...formData, prayerCategory: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select category...</option>
                      <option value="health">Health & Healing</option>
                      <option value="family">Family & Relationships</option>
                      <option value="financial">Financial</option>
                      <option value="spiritual">Spiritual Growth</option>
                      <option value="guidance">Guidance & Direction</option>
                      <option value="thanksgiving">Thanksgiving</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="shareWithChurch"
                      checked={formData.shareWithChurch}
                      onChange={(e) => setFormData({ ...formData, shareWithChurch: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="shareWithChurch" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I'm comfortable sharing this prayer request with the church community
                    </label>
                  </div>
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Acknowledgment</h3>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Confidentiality Notice:</strong> All information shared through this form will be kept strictly confidential and will only be accessed by authorized church staff members who need this information to serve you effectively. We are committed to protecting your privacy and maintaining the confidentiality of your personal information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                    />
                    <label htmlFor="privacyConsent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I consent to the collection, use, and storage of my personal information by Salem Primitive Baptist Church for the purpose of responding to my inquiry and providing requested services. I understand that my information will be kept confidential and used only by authorized personnel. *
                    </label>
                  </div>
                  {errors.privacyConsent && <p className="text-sm text-red-600">{errors.privacyConsent}</p>}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="informationAccuracy"
                      checked={formData.informationAccuracy}
                      onChange={(e) => setFormData({ ...formData, informationAccuracy: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                    />
                    <label htmlFor="informationAccuracy" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I acknowledge that all information provided in this form is accurate and genuine to the best of my knowledge. I understand that providing false information may affect the church's ability to serve me effectively. *
                    </label>
                  </div>
                  {errors.informationAccuracy && <p className="text-sm text-red-600">{errors.informationAccuracy}</p>}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Response Time:</strong> We typically respond within 24 hours for general inquiries, within 4 hours for urgent matters, and immediately for emergencies. For prayer requests marked as urgent, a pastor will contact you within 2 hours during business hours.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Please share your message with us..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>

              {(formData.formType === 'prayer' || formData.formType === 'pastoral' || formData.formType === 'counseling') && (
                <>
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="urgentCallback"
                      checked={formData.urgentCallback}
                      onChange={(e) => setFormData({ ...formData, urgentCallback: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="urgentCallback" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Please call me back as soon as possible
                    </label>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-up Preference (Optional)
                  </label>
                  <select
                    value={formData.followUpPreference}
                    onChange={(e) => setFormData({ ...formData, followUpPreference: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select preference...</option>
                    <option value="email">Email only</option>
                    <option value="phone">Phone call</option>
                    <option value="text">Text message</option>
                    <option value="in-person">In-person meeting</option>
                    <option value="no-followup">No follow-up needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specific Pastor/Staff (Optional)
                  </label>
                  <select
                    value={formData.specificPastor}
                    onChange={(e) => setFormData({ ...formData, specificPastor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any available staff</option>
                    <option value="senior-pastor">Senior Pastor</option>
                    <option value="associate-pastor">Associate Pastor</option>
                    <option value="youth-pastor">Youth Pastor</option>
                    <option value="children-director">Children's Director</option>
                    <option value="counselor">Church Counselor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Needs/Accommodations (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Any accessibility needs, dietary restrictions, or other accommodations..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language Preference (Optional)
                  </label>
                  <select
                    value={formData.languagePreference}
                    onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select language...</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="tamil">Tamil</option>
                    <option value="hindi">Hindi</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternate Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.alternateContact}
                    onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Alternate contact person & number"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}