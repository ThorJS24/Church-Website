'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Image as ImageIcon, Calendar, Settings } from 'lucide-react';
import UserManagement from '@/components/UserManagement';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role === 'admin') {
        setUser(userData);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
    { id: 'events', label: 'Event Management', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your church website and community
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'gallery' && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Gallery Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gallery management features coming soon...
                </p>
              </div>
            )}
            {activeTab === 'events' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Event Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Event management features coming soon...
                </p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Settings panel coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}