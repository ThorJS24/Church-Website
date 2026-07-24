'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Download, Trash2, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';

export default function GDPRCompliance() {
  const { user } = useAuth();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [requestStatus, setRequestStatus] = useState<{ type: 'download' | 'delete' | null; state: 'idle' | 'working' | 'success' | 'error' }>({ type: null, state: 'idle' });

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('gdpr-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('gdpr-consent', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleDataRequest = async (type: 'download' | 'delete') => {
    if (!user) {
      router.push('/login');
      return;
    }

    setRequestStatus({ type, state: 'working' });
    try {
      const token = await getIdToken();
      const response = await fetch(
        type === 'download' ? '/api/privacy/download-data' : '/api/privacy/delete-account',
        {
          method: type === 'download' ? 'POST' : 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        setRequestStatus({ type, state: 'error' });
        return;
      }

      if (type === 'download') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-church-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      setRequestStatus({ type, state: 'success' });
    } catch (error) {
      console.error('GDPR request error:', error);
      setRequestStatus({ type, state: 'error' });
    }
  };

  return (
    <>
      {/* GDPR Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            role="region"
            aria-label="Cookie preferences"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Privacy & Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                    You can customize your preferences below.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-xs">Necessary</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-xs">Analytics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-xs">Marketing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-xs">Functional</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GDPR Management Panel */}
      <div role="region" aria-label="Data privacy and rights" className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Data Privacy & Rights
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Eye className="w-4 h-4 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-sm">View Privacy Policy</p>
                <p className="text-xs text-gray-500">Learn how we handle your data</p>
              </div>
            </div>
            <button onClick={() => router.push('/privacy')} className="text-blue-600 text-sm hover:underline">
              View
            </button>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="w-4 h-4 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-sm">Download My Data</p>
                  <p className="text-xs text-gray-500">Get a copy of your personal data</p>
                </div>
              </div>
              <button
                onClick={() => handleDataRequest('download')}
                disabled={requestStatus.type === 'download' && requestStatus.state === 'working'}
                className="text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                {requestStatus.type === 'download' && requestStatus.state === 'working' ? 'Preparing...' : 'Download'}
              </button>
            </div>
            {requestStatus.type === 'download' && requestStatus.state === 'error' && (
              <p className="text-xs text-red-600 mt-2">Couldn&apos;t download your data. Please try again.</p>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trash2 className="w-4 h-4 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-sm">Delete My Account</p>
                  <p className="text-xs text-gray-500">Permanently remove your data</p>
                </div>
              </div>
              <button
                onClick={() => handleDataRequest('delete')}
                disabled={requestStatus.type === 'delete' && (requestStatus.state === 'working' || requestStatus.state === 'success')}
                className="text-red-600 text-sm hover:underline disabled:opacity-50"
              >
                {requestStatus.type === 'delete' && requestStatus.state === 'working' ? 'Submitting...' : 'Request'}
              </button>
            </div>
            {requestStatus.type === 'delete' && requestStatus.state === 'success' && (
              <p className="text-xs text-green-600 mt-2">Request received — our staff will follow up by email.</p>
            )}
            {requestStatus.type === 'delete' && requestStatus.state === 'error' && (
              <p className="text-xs text-red-600 mt-2">Couldn&apos;t submit your request. Please try again.</p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Settings className="w-4 h-4 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-sm">Cookie Preferences</p>
                <p className="text-xs text-gray-500">Manage your cookie settings</p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </>
  );
}