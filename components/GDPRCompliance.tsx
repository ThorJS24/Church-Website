'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Shield, Download, Trash2, Eye, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

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
    const allAccepted = { necessary: true, analytics: true, marketing: true, functional: true };
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
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg"
          >
            <div className="mx-auto max-w-6xl">
              <div className="flex items-start justify-between">
                <div className="mr-4 flex-1">
                  <div className="mb-2 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-accent" />
                    <h3 className="font-serif text-title-sm text-foreground">Privacy &amp; Cookies</h3>
                  </div>
                  <p className="mb-4 text-body-sm text-foreground-muted">
                    We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
                    You can customize your preferences below.
                  </p>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Checkbox label="Necessary" checked={preferences.necessary} disabled onChange={() => {}} />
                    <Checkbox
                      label="Analytics"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))}
                    />
                    <Checkbox
                      label="Marketing"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))}
                    />
                    <Checkbox
                      label="Functional"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, functional: e.target.checked }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary" size="sm" onClick={handleSavePreferences}>Save Preferences</Button>
                  <Button size="sm" onClick={handleAcceptAll}>Accept All</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GDPR Management Panel */}
      <div role="region" aria-label="Data privacy and rights" className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h3 className="mb-4 flex items-center font-serif text-title-md text-foreground">
          <Shield className="mr-2 h-5 w-5 text-accent" />
          Data Privacy &amp; Rights
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-surface p-3">
            <div className="flex items-center">
              <Eye className="mr-3 h-4 w-4 text-foreground-muted" />
              <div>
                <p className="text-body-sm font-medium text-foreground">View Privacy Policy</p>
                <p className="text-caption text-foreground-subtle">Learn how we handle your data</p>
              </div>
            </div>
            <button onClick={() => router.push('/privacy')} className="text-body-sm text-accent hover:underline">
              View
            </button>
          </div>

          <div className="rounded-lg bg-surface p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="mr-3 h-4 w-4 text-foreground-muted" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">Download My Data</p>
                  <p className="text-caption text-foreground-subtle">Get a copy of your personal data</p>
                </div>
              </div>
              <button
                onClick={() => handleDataRequest('download')}
                disabled={requestStatus.type === 'download' && requestStatus.state === 'working'}
                className="text-body-sm text-accent hover:underline disabled:opacity-50"
              >
                {requestStatus.type === 'download' && requestStatus.state === 'working' ? 'Preparing...' : 'Download'}
              </button>
            </div>
            {requestStatus.type === 'download' && requestStatus.state === 'error' && (
              <p className="mt-2 text-caption text-danger">Couldn&apos;t download your data. Please try again.</p>
            )}
          </div>

          <div className="rounded-lg bg-surface p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trash2 className="mr-3 h-4 w-4 text-danger" />
                <div>
                  <p className="text-body-sm font-medium text-foreground">Delete My Account</p>
                  <p className="text-caption text-foreground-subtle">Permanently remove your data</p>
                </div>
              </div>
              <button
                onClick={() => handleDataRequest('delete')}
                disabled={requestStatus.type === 'delete' && (requestStatus.state === 'working' || requestStatus.state === 'success')}
                className="text-body-sm text-danger hover:underline disabled:opacity-50"
              >
                {requestStatus.type === 'delete' && requestStatus.state === 'working' ? 'Submitting...' : 'Request'}
              </button>
            </div>
            {requestStatus.type === 'delete' && requestStatus.state === 'success' && (
              <p className="mt-2 text-caption text-success">Request received — our staff will follow up by email.</p>
            )}
            {requestStatus.type === 'delete' && requestStatus.state === 'error' && (
              <p className="mt-2 text-caption text-danger">Couldn&apos;t submit your request. Please try again.</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface p-3">
            <div className="flex items-center">
              <Settings className="mr-3 h-4 w-4 text-foreground-muted" />
              <div>
                <p className="text-body-sm font-medium text-foreground">Cookie Preferences</p>
                <p className="text-caption text-foreground-subtle">Manage your cookie settings</p>
              </div>
            </div>
            <button onClick={() => setShowBanner(true)} className="text-body-sm text-accent hover:underline">
              Manage
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
