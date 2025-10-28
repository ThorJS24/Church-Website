'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, User } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: { email: true, events: true, prayers: true },
    privacy: { profileVisible: true, contactVisible: false }
  });

  const handleToggle = (section: string, key: string) => {
    setSettings(prev => {
      const sectionData = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [key]: !sectionData[key]
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="space-y-3 ml-7">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button onClick={() => handleToggle('notifications', key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h3>
              </div>
              <div className="space-y-3 ml-7">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button onClick={() => handleToggle('privacy', key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h3>
              </div>
              <div className="space-y-3 ml-7">
                <button className="text-blue-600 hover:text-blue-700 text-sm">Change Password</button>
                <br />
                <button className="text-red-600 hover:text-red-700 text-sm">Delete Account</button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => alert('Settings saved!')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}