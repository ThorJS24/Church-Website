'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Heart, MessageSquare, TrendingUp, Bell, Settings, LogOut } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface DashboardStats {
  totalMembers: number
  upcomingEvents: number
  prayerRequests: number
  recentDonations: number
  monthlyGrowth: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalMembers: 487,
        upcomingEvents: 12,
        prayerRequests: 23,
        recentDonations: 156,
        monthlyGrowth: 8.5
      })
    } catch (error) {
      console.error('Dashboard data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { icon: Users, label: 'Total Members', value: stats?.totalMembers || 0, color: 'blue' },
    { icon: Calendar, label: 'Upcoming Events', value: stats?.upcomingEvents || 0, color: 'green' },
    { icon: Heart, label: 'Prayer Requests', value: stats?.prayerRequests || 0, color: 'purple' },
    { icon: TrendingUp, label: 'Monthly Growth', value: `${stats?.monthlyGrowth || 0}%`, color: 'orange' }
  ]

  const recentActivities = [
    { type: 'member', message: 'John Doe joined the church', time: '2 hours ago' },
    { type: 'event', message: 'Youth Group meeting scheduled', time: '4 hours ago' },
    { type: 'prayer', message: 'New prayer request submitted', time: '6 hours ago' },
    { type: 'donation', message: 'Donation of ₹5,000 received', time: '1 day ago' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Church Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, John Doe</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Settings className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <card.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Create Event</span>
                  </div>
                </button>
                <a href="/profile" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">My Profile</span>
                  </div>
                </a>
                <a href="/events" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">View Events</span>
                  </div>
                </a>
                <a href="/sermons" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Watch Sermons</span>
                  </div>
                </a>
                <a href="/prayer" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Prayer Requests</span>
                  </div>
                </a>
                <a href="/give" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Give Online</span>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}