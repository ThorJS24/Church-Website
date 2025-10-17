'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Users, X } from 'lucide-react';

const categories = ['all', 'healing', 'guidance', 'thanksgiving', 'family', 'work'];

export default function PrayerPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    isPrivate: false,
    isAnonymous: false,
    authorName: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setShowModal(false);
      setFormData({ 
        title: '', 
        category: 'general', 
        description: '', 
        isPrivate: false, 
        isAnonymous: false, 
        authorName: '' 
      });
    }, 1000);
  };

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
            Prayer Requests
          </motion.h1>
          <motion.p 
            className="text-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Share your prayer needs and join us in lifting each other up
          </motion.p>
          <motion.button
            onClick={() => setShowModal(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Submit Prayer Request
          </motion.button>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  activeFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Prayers' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Prayer Requests Placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Prayer requests will appear here</h3>
            <p className="text-gray-500">Submit a prayer request to get started</p>
          </div>
        </div>
      </section>

      {/* Prayer Statistics */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-200">Prayer Requests</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">People Praying</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-200">Prayers Offered</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prayer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Submit Prayer Request</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prayer Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a title for your prayer request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="healing">Healing</option>
                    <option value="guidance">Guidance</option>
                    <option value="thanksgiving">Thanksgiving</option>
                    <option value="family">Family</option>
                    <option value="work">Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prayer Request *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your prayer request..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">
                      Submit anonymously
                    </label>
                  </div>
                  
                  {!formData.isAnonymous && (
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name (optional)"
                    />
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                      Keep this prayer private (only pastors will see it)
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Submit Prayer
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          <p>Prayer request submitted successfully!</p>
        </div>
      )}

      {/* Encouragement Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">The Power of Prayer</h2>
            <blockquote className="text-xl italic text-gray-700 mb-4 max-w-3xl mx-auto">
              "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours."
            </blockquote>
            <cite className="text-blue-600 font-semibold">Mark 11:24</cite>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              We believe in the power of prayer and the strength that comes from praying together as a community. 
              Your prayers matter, and we are honored to lift each other up before God.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}