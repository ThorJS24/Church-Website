'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { offlineManager } from '@/lib/offline';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const online = offlineManager.getConnectionStatus();
      const pending = offlineManager.getPendingSync();
      
      setIsOnline(online);
      setPendingSync(pending);
      setShowIndicator(!online || pending > 0);
    };

    // Initial check
    updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Check periodically for pending sync
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
            isOnline 
              ? 'bg-blue-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {isOnline ? (
              <>
                <Cloud className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingSync > 0 ? `Syncing ${pendingSync} items...` : 'Online'}
                </span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline Mode</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}