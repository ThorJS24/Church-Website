'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Shield, Download, Trash2, FileText, Cookie, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { toast } from '@/lib/toast';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'policy' | 'cookies';
}

export default function PrivacyDialog({ isOpen, onClose, initialTab = 'overview' }: PrivacyDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'working' | 'error'>('idle');
  const [deleteState, setDeleteState] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true
  });

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    const saved = localStorage.getItem('cookiePreferences');
    if (saved) setCookiePreferences(JSON.parse(saved));
  }, [isOpen, initialTab]);

  const handleDataDownload = async () => {
    if (!user) {
      onClose();
      router.push('/login');
      return;
    }

    setDownloadState('working');
    try {
      const token = await getIdToken();
      const response = await fetch('/api/privacy/download-data', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-church-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
        setDownloadState('idle');
      } else {
        setDownloadState('error');
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadState('error');
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) {
      setShowDeleteConfirm(false);
      onClose();
      router.push('/login');
      return;
    }

    setDeleteState('working');
    try {
      const token = await getIdToken();
      const response = await fetch('/api/privacy/delete-account', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setDeleteState(response.ok ? 'success' : 'error');
    } catch (error) {
      console.error('Deletion request failed:', error);
      setDeleteState('error');
    }
  };

  const saveCookiePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    toast({ title: 'Cookie preferences saved', variant: 'success' });
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
      description: downloadState === 'error' ? 'Something went wrong — please try again.' : 'Get a copy of your data',
      action: handleDataDownload,
      buttonText: downloadState === 'working' ? 'Preparing...' : 'Download'
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={
      <span className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-accent" /> Data Privacy &amp; Rights
      </span>
    }>
      <div className="relative">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof initialTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              {privacyActions.map((action) => (
                <div key={action.id} className="rounded-lg border border-border p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${action.danger ? 'bg-danger-subtle' : 'bg-accent-subtle'}`}>
                      <action.icon className={`h-5 w-5 ${action.danger ? 'text-danger' : 'text-accent'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-foreground">{action.title}</h3>
                      <p className="mb-3 text-body-sm text-foreground-muted">{action.description}</p>
                      <Button size="sm" variant={action.danger ? 'danger' : 'primary'} onClick={action.action}>
                        {action.buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policy">
            <div className="prose prose-sm dark:prose-invert max-w-none">
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
          </TabsContent>

          <TabsContent value="cookies">
            <p className="mb-4 text-body-sm text-foreground-muted">Manage cookie preferences:</p>
            <div className="space-y-3">
              {Object.entries(cookiePreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <h4 className="text-body-sm font-medium capitalize text-foreground">{key} Cookies</h4>
                    <p className="text-caption text-foreground-muted">
                      {key === 'essential' && 'Required for functionality'}
                      {key === 'analytics' && 'Help us improve'}
                      {key === 'marketing' && 'Relevant content'}
                      {key === 'functional' && 'Remember preferences'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    disabled={key === 'essential'}
                    label={`${key} cookies`}
                    onChange={(checked) => setCookiePreferences((prev) => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-4" onClick={saveCookiePreferences}>Save Preferences</Button>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 -m-6 flex items-center justify-center bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-4 max-w-sm rounded-lg bg-background p-6 shadow-xl">
              {deleteState === 'success' ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    <h3 className="font-semibold text-foreground">Request Received</h3>
                  </div>
                  <p className="mb-4 text-body-sm text-foreground-muted">
                    Our staff will review your request and follow up with you by email.
                  </p>
                  <Button fullWidth onClick={() => { setShowDeleteConfirm(false); setDeleteState('idle'); onClose(); }}>Close</Button>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-danger" />
                    <h3 className="font-semibold text-foreground">Confirm Deletion Request</h3>
                  </div>
                  <p className="mb-4 text-body-sm text-foreground-muted">
                    This submits a request to permanently delete your account and data. It doesn&apos;t happen
                    instantly — our staff review every request and will follow up with you by email before
                    anything is removed.
                  </p>
                  {deleteState === 'error' && (
                    <p className="mb-4 text-body-sm text-danger">Something went wrong submitting your request. Please try again.</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" fullWidth disabled={deleteState === 'working'} onClick={() => { setShowDeleteConfirm(false); setDeleteState('idle'); }}>
                      Cancel
                    </Button>
                    <Button variant="danger" fullWidth loading={deleteState === 'working'} onClick={handleAccountDeletion}>
                      {deleteState === 'working' ? 'Submitting...' : 'Request Deletion'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </Modal>
  );
}
