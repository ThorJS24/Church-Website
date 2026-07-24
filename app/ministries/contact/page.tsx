'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMinistries } from '@/lib/content';

interface Ministry {
  id: string;
  title: string;
}

export default function ContactMinistryLeaderPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingMinistries, setLoadingMinistries] = useState(true);

  const [formData, setFormData] = useState({
    ministry: '',
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    setLoadingMinistries(true);
    try {
      const ministriesData = await getMinistries();
      const list = ministriesData.map(m => ({ id: m.id, title: m.title }));
      setMinistries(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, ministry: prev.ministry || list[0].id }));
      }
    } catch (error) {
      console.error('Error fetching ministries:', error);
    } finally {
      setLoadingMinistries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const ministryTitle = ministries.find(m => m.id === formData.ministry)?.title || formData.ministry;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          message: formData.message,
          department: 'ministry-contact',
          ministry: ministryTitle,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData(prev => ({ ...prev, firstName: '', lastName: '', email: '', message: '' }));
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error contacting ministry leader:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">Contact a Ministry Leader</h1>
          <p className="mt-4 text-lg text-gray-600 text-center">We&apos;re here to help you get connected. Select a ministry and send your message.</p>
        </motion.div>

        <motion.div
          className="mt-12 bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
              <p className="text-gray-600 mb-6">Thank you for reaching out — a ministry leader will be in touch soon.</p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="ministry" className="block text-sm font-medium text-gray-700">Ministry</label>
                  <select
                    id="ministry"
                    name="ministry"
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    disabled={loadingMinistries}
                    required
                  >
                    {loadingMinistries ? (
                      <option>Loading ministries...</option>
                    ) : ministries.length === 0 ? (
                      <option value="">No ministries available</option>
                    ) : (
                      ministries.map(ministry => (
                        <option key={ministry.id} value={ministry.id}>{ministry.title}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">Something went wrong sending your message. Please try again.</p>
                </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
