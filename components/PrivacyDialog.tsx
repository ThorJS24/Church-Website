'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Download, Trash2, FileText, Cookie, X, AlertCircle } from 'lucide-react';

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyDialog({ isOpen, onClose }: PrivacyDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true
  });

  const handleDataDownload = async () => {
    try {
      const response = await fetch('/api/privacy/download-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const response = await fetch('/api/privacy/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert('Account deletion request submitted.');
        setShowDeleteConfirm(false);
        onClose();
      }
    } catch (error) {
      console.error('Deletion request failed:', error);
    }
  };

  const saveCookiePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved!');
  };

  const privacyActions = [
    {
      id: 'policy',
      icon: FileText,
      title: 'Privacy Policy',
      description: 'Learn how we handle your data',
      action: () => window.open('/privacy', '_blank'),
      buttonText: 'View'
    },
    {
      id: 'download',
      icon: Download,
      title: 'Download Data',
      description: 'Get a copy of your data',
      action: handleDataDownload,
      buttonText: 'Download'
    },
    {
      id: 'delete',
      icon: Trash2,
      title: 'Delete Account',
      description: 'Remove your data',
      action: () => setShowDeleteConfirm(true),
      buttonText: 'Request',
      danger: true
    },
    {
      id: 'cookies',
      icon: Cookie,
      title: 'Cookie Settings',
      description: 'Manage cookies',
      action: () => setActiveTab('cookies'),
      buttonText: 'Manage'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Data Privacy & Rights
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
              {['overview', 'policy', 'cookies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {privacyActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          action.danger ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          <action.icon className={`w-5 h-5 ${
                            action.danger ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {action.description}
                          </p>
                          <button
                            onClick={action.action}
                            className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                              action.danger
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {action.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'policy' && (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <h3>Information We Collect</h3>
                  <p>We collect information you provide when you create accounts, submit requests, or contact us.</p>
                  
                  <h3>How We Use Information</h3>
                  <ul>
                    <li>Provide and maintain services</li>
                    <li>Communicate about church activities</li>
                    <li>Send updates with your consent</li>
                    <li>Improve our services</li>
                  </ul>

                  <h3>Your Rights</h3>
                  <p>You can access, update, or delete your information using the options in this dialog.</p>
                </div>
              )}

              {activeTab === 'cookies' && (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Manage cookie preferences:
                  </p>
                  <div className="space-y-3">
                    {Object.entries(cookiePreferences).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                            {key} Cookies
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {key === 'essential' && 'Required for functionality'}
                            {key === 'analytics' && 'Help us improve'}
                            {key === 'marketing' && 'Relevant content'}
                            {key === 'functional' && 'Remember preferences'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            disabled={key === 'essential'}
                            onChange={(e) => setCookiePreferences(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={saveCookiePreferences}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                  >
                    Save Preferences
                  </button>
                </div>
              )}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
                >
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Confirm Deletion
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    This cannot be undone. All data will be deleted.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAccountDeletion}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}