'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Heart, DollarSign, Book, Users, 
  Bell, Settings, Shield, QrCode, Download 
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { hasPermission, Permission } from '@/lib/permissions';

interface DashboardStats {
  attendanceCount: number;
  prayerRequests: number;
  donationTotal: number;
  upcomingEvents: number;
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    attendanceCount: 0,
    prayerRequests: 0,
    donationTotal: 0,
    upcomingEvents: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/member/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Calendar, label: 'View Events', href: '/events', color: 'bg-blue-500' },
    { icon: Heart, label: 'Prayer Requests', href: '/prayer', color: 'bg-pink-500' },
    { icon: DollarSign, label: 'Give Online', href: '/give', color: 'bg-green-500' },
    { icon: Book, label: 'Sermons', href: '/sermons', color: 'bg-purple-500' },
    { icon: Users, label: 'Small Groups', href: '/ministries', color: 'bg-orange-500' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || user.displayName}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your church community</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services Attended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prayer Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.prayerRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Given</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.donationTotal}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-center"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                </motion.a>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow">
                {recentActivity.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile & Security */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile & Security</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-blue-600 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium">Two-Factor Auth</span>
                  </div>
                  <span className="text-xs text-gray-500">Setup</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <QrCode className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium">Member QR Code</span>
                  </div>
                  <span className="text-xs text-gray-500">View</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium">Download Data</span>
                  </div>
                  <span className="text-xs text-gray-500">GDPR</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium">Notifications</span>
                  </div>
                  <span className="text-xs text-gray-500">Manage</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}