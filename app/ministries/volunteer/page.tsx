'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sanityFetch } from '@/lib/sanity-fetch';

interface Ministry {
  _id: string;
  title: string;
}

export default function VolunteerApplicationPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    setLoading(true);
    try {
      const ministriesData = await sanityFetch(`*[_type == "ministry"]{_id, title}`);
      if (ministriesData) {
        setMinistries(ministriesData);
      }
    } catch (error) {
      console.error('Error fetching ministries:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">Volunteer Application</h1>
          <p className="mt-4 text-lg text-gray-600 text-center">Join us in serving the community. Fill out the form below to apply.</p>
        </motion.div>

        <motion.div
          className="mt-12 bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ministry" className="block text-sm font-medium text-gray-700">Select Ministry</label>
                <select
                  id="ministry"
                  name="ministry"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={loading}
                >
                  {loading ? (
                    <option>Loading ministries...</option>
                  ) : (
                    ministries.map(ministry => (
                      <option key={ministry._id} value={ministry._id}>{ministry.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="firstName" id="firstName" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="lastName" id="lastName" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" id="phone" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Why do you want to volunteer?</label>
                <textarea id="message" name="message" rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Application
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
