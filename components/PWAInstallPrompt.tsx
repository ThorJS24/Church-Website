'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');

    if (!isInstalled && !hasBeenDismissed) {
      if (iOS) {
        // Show iOS install instructions after a delay
        setTimeout(() => setShowPrompt(true), 3000);
      } else {
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border z-50 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Install Church App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            {isIOS 
              ? 'Add Salem PBC to your home screen for quick access to sermons, events, and more!'
              : 'Install our app for offline access, push notifications, and a better experience!'
            }
          </p>
          
          {isIOS ? (
            <div className="text-xs text-gray-500 mb-4">
              <p>To install:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
              >
                Not now
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}