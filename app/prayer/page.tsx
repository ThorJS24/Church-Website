'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Users, X } from 'lucide-react';
import PrayerEffects from '@/components/PrayerEffects';
import SacredText from '@/components/SacredText';
import DivineButton from '@/components/DivineButton';
import HeavenlyCard from '@/components/HeavenlyCard';

const categories = ['all', 'healing', 'guidance', 'thanksgiving', 'family', 'work'];

export default function PrayerPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [prayerStats, setPrayerStats] = useState({ requests: 0, people: 0, prayers: 0 });
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    isPrivate: false,
    isAnonymous: false,
    authorName: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    fetchPrayerStats();
  }, []);

  const fetchPrayerStats = async () => {
    try {
      const stats = await sanityFetch(`*[_type == "siteSettings"][0] {
        prayerStats {
          totalRequests,
          totalPeople,
          totalPrayers
        }
      }`);
      if (stats?.prayerStats) {
        setPrayerStats({
          requests: stats.prayerStats.totalRequests || 0,
          people: stats.prayerStats.totalPeople || 0,
          prayers: stats.prayerStats.totalPrayers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching prayer stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
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
      } else {
        alert(data.message || 'Failed to submit prayer request');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 relative">
      <PrayerEffects isActive={true} intensity="high" />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <PrayerEffects isActive={true} intensity="medium" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <SacredText size="xl" className="text-5xl font-bold mb-4" glowColor="text-yellow-300">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Prayer Requests
            </motion.h1>
          </SacredText>
          <motion.p 
            className="text-xl mb-8 text-yellow-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Share your prayer needs and join us in lifting each other up
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <DivineButton
              onClick={() => setShowModal(true)}
              variant="prayer"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Prayer Request
            </DivineButton>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600 shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'all' ? 'All Prayers' : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Prayer Requests Placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <HeavenlyCard glowIntensity="medium" className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-16 h-16 text-purple-400 dark:text-purple-300 mx-auto mb-4" />
            </motion.div>
            <SacredText className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              <h3>Prayer requests will appear here</h3>
            </SacredText>
            <p className="text-gray-500 dark:text-gray-400">Submit a prayer request to get started</p>
          </HeavenlyCard>
        </div>
      </section>

      {/* Prayer Statistics */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <PrayerEffects isActive={true} intensity="low" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <HeavenlyCard glowIntensity="high" className="bg-white/10 backdrop-blur-md border-white/20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                </motion.div>
                <SacredText className="text-4xl font-bold mb-2 text-white">
                  <div>{prayerStats.requests > 0 ? `${prayerStats.requests}+` : '∞'}</div>
                </SacredText>
                <div className="text-yellow-200">Prayer Requests</div>
              </motion.div>
            </HeavenlyCard>
            <HeavenlyCard glowIntensity="high" className="bg-white/10 backdrop-blur-md border-white/20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Users className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                </motion.div>
                <SacredText className="text-4xl font-bold mb-2 text-white">
                  <div>{prayerStats.people > 0 ? `${prayerStats.people}+` : '∞'}</div>
                </SacredText>
                <div className="text-yellow-200">People Praying</div>
              </motion.div>
            </HeavenlyCard>
            <HeavenlyCard glowIntensity="high" className="bg-white/10 backdrop-blur-md border-white/20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Heart className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                </motion.div>
                <SacredText className="text-4xl font-bold mb-2 text-white">
                  <div>{prayerStats.prayers > 0 ? `${prayerStats.prayers}+` : '∞'}</div>
                </SacredText>
                <div className="text-yellow-200">Prayers Offered</div>
              </motion.div>
            </HeavenlyCard>
          </div>
        </div>
      </section>

      {/* Prayer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PrayerEffects isActive={true} intensity="medium" />
          <HeavenlyCard glowIntensity="high" className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <SacredText className="text-2xl font-bold text-gray-900 dark:text-white">
                  <h3>Submit Prayer Request</h3>
                </SacredText>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
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
                  <DivineButton
                    onClick={() => setShowModal(false)}
                    variant="secondary"
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </DivineButton>
                  <DivineButton
                    variant="prayer"
                    className="flex-1"
                  >
                    Submit Prayer
                  </DivineButton>
                </div>
              </form>
            </motion.div>
          </HeavenlyCard>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          <p>Prayer request submitted successfully!</p>
        </div>
      )}

      {/* Encouragement Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/50 dark:from-yellow-950/50 dark:via-orange-950/30 dark:to-red-950/50">
        <div className="container mx-auto px-4 text-center">
          <HeavenlyCard glowIntensity="high" className="max-w-4xl mx-auto p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SacredText size="xl" className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                <h2>The Power of Prayer</h2>
              </SacredText>
              <SacredText className="text-xl italic text-gray-700 dark:text-gray-300 mb-4">
                <blockquote>
                  &quot;Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.&quot;
                </blockquote>
              </SacredText>
              <cite className="text-yellow-600 dark:text-yellow-400 font-semibold text-lg">Mark 11:24</cite>
              <p className="text-gray-600 dark:text-gray-400 mt-6 leading-relaxed">
                We believe in the power of prayer and the strength that comes from praying together as a community. 
                Your prayers matter, and we are honored to lift each other up before God.
              </p>
            </motion.div>
          </HeavenlyCard>
        </div>
      </section>
    </div>
  );
}