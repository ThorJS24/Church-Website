'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import PrivacyDialog from './PrivacyDialog';

const STORAGE_KEY = 'cookiePreferences';

/**
 * First-visit cookie consent — a small popup (not a docked bar), because a
 * fixed bottom frame reads as an ugly, unremovable strip on top of page
 * content. "Customize" hands off to PrivacyDialog's Cookies tab instead of
 * duplicating the toggle UI here, so there's one source of truth for
 * cookie preferences.
 */
export default function GDPRCompliance() {
  const [showPopup, setShowPopup] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setShowPopup(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, marketing: true, functional: true }));
    setShowPopup(false);
  };

  const necessaryOnly = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, marketing: false, functional: false }));
    setShowPopup(false);
  };

  return (
    <>
      <Modal
        isOpen={showPopup}
        onClose={necessaryOnly}
        size="sm"
        title={
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" /> Privacy &amp; Cookies
          </span>
        }
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setShowPopup(false); setShowCustomize(true); }}
            >
              Customize
            </Button>
            <Button variant="outline" size="sm" onClick={necessaryOnly}>Necessary Only</Button>
            <Button size="sm" onClick={acceptAll}>Accept All</Button>
          </div>
        }
      >
        <p className="text-body-sm text-foreground-muted">
          We use cookies to enhance your experience, analyze site usage, and assist in our marketing
          efforts. You can accept everything, keep only what&apos;s necessary, or customize your preferences.
        </p>
      </Modal>

      <PrivacyDialog isOpen={showCustomize} onClose={() => setShowCustomize(false)} initialTab="cookies" />
    </>
  );
}
