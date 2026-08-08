'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { Button } from '@/components/ui/button';

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
          role="region"
          aria-label="Install app prompt"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          // Same MobileBottomNav collision as DivineAudio (see that
          // component for the CDP-confirmed geometry) — worse here, since
          // this is a near-full-width banner that would sit on top of most
          // of the nav bar rather than just one tab.
          className="fixed inset-x-4 bottom-24 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:inset-x-auto md:right-4 md:bottom-4 md:w-80"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5 text-accent" />
              <h3 className="font-serif text-title-sm text-foreground">Install Church App</h3>
            </div>
            <IconButton label="Dismiss" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>

          <p className="mb-4 text-body-sm text-foreground-muted">
            {isIOS
              ? 'Add Salem PBC to your home screen for quick access to sermons, events, and more!'
              : 'Install our app for offline access, push notifications, and a better experience!'}
          </p>

          {isIOS ? (
            <div className="mb-4 text-caption text-foreground-subtle">
              <p>To install:</p>
              <ol className="mt-1 list-inside list-decimal space-y-1">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to confirm</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" leftIcon={<Download className="h-4 w-4" />} fullWidth>
                Install App
              </Button>
              <Button onClick={handleDismiss} variant="ghost" size="sm">
                Not now
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
