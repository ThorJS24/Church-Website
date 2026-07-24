'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Calendar, Clock, Send, CheckCircle } from 'lucide-react';

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: [] as string[],
    availability: [] as string[],
    experience: '',
    motivation: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const volunteerAreas = [
    'Children&#39;s Ministry',
    'Youth Ministry',
    'Worship Team',
    'Hospitality',
    'Ushering',
    'Audio/Visual',
    'Maintenance',
    'Outreach',
    'Prayer Ministry',
    'Administrative'
  ];

  const availabilityOptions = [
    'Sunday Morning',
    'Sunday Evening',
    'Wednesday Evening',
    'Weekday Mornings',
    'Weekday Evenings',
    'Special Events'
  ];

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvailabilityChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(a => a !== time)
        : [...prev.availability, time]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.motivation,
          department: 'volunteer',
          age: formData.age,
          interests: formData.interests,
          availability: formData.availability,
          experience: formData.experience,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Something went wrong submitting your application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting volunteer application:', err);
      setError('Something went wrong submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your volunteer application has been submitted. We'll contact you soon!</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Volunteer With Us
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join our mission to serve God and our community
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Volunteer Application</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="volunteer-name" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Full Name *</label>
                <input
                  id="volunteer-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="volunteer-email" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Email *</label>
                <input
                  id="volunteer-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-4 text-gray-900 dark:text-white">Areas of Interest *</label>
              <div className="grid md:grid-cols-2 gap-3">
                {volunteerAreas.map(area => (
                  <label key={area} className="flex items-center text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(area)}
                      onChange={() => handleInterestChange(area)}
                      className="mr-2"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Why do you want to volunteer? *</label>
              <textarea
                required
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Share your motivation for volunteering..."
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}