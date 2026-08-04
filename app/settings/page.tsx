'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Shield, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { LoadingState } from '@/components/ui/States';

type Notifications = { email: boolean; events: boolean; prayers: boolean };
type Privacy = { profileVisible: boolean; contactVisible: boolean };

export default function SettingsPage() {
  const { user, isLoading, updateUser, changePassword } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notifications>({ email: true, events: true, prayers: true });
  const [privacy, setPrivacy] = useState<Privacy>({ profileVisible: true, contactVisible: false });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setNotifications({
        email: user.notificationPreferences?.email ?? true,
        events: user.notificationPreferences?.events ?? true,
        prayers: user.notificationPreferences?.prayers ?? true,
      });
      setPrivacy({
        profileVisible: user.privacyPreferences?.profileVisible ?? true,
        contactVisible: user.privacyPreferences?.contactVisible ?? false,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const success = await updateUser({ notificationPreferences: notifications, privacyPreferences: privacy });
      setSaveStatus(success ? 'success' : 'error');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordStatus('idle');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setPasswordStatus('error');
      const code = (err as { code?: string })?.code;
      setPasswordError(code === 'auth/wrong-password' || code === 'auth/invalid-credential' ? 'Current password is incorrect.' : 'Could not change your password. Please try again.');
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus('idle');
    try {
      const token = await getIdToken();
      const response = await fetch('/api/privacy/delete-account', { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await response.json();
      setDeleteStatus(data.success ? 'success' : 'error');
    } catch {
      setDeleteStatus('error');
    }
  };

  if (isLoading || !user) return <LoadingState />;

  return (
    <Container size="md" className="py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="raised" padding="none">
          <div className="flex items-center gap-3 border-b border-border p-6">
            <Settings className="h-6 w-6 text-accent" />
            <h1 className="text-headline-sm text-foreground">Settings</h1>
          </div>

          <div className="space-y-8 p-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-foreground-muted" />
                <h3 className="text-title-md text-foreground">Notifications</h3>
              </div>
              <div className="ml-7 space-y-3">
                {(Object.entries(notifications) as [keyof Notifications, boolean][]).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-body-sm capitalize text-foreground-muted">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Switch checked={value} onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))} label={`Toggle ${key} notifications`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-foreground-muted" />
                <h3 className="text-title-md text-foreground">Privacy</h3>
              </div>
              <div className="ml-7 space-y-3">
                {(Object.entries(privacy) as [keyof Privacy, boolean][]).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-body-sm capitalize text-foreground-muted">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Switch checked={value} onChange={() => setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))} label={`Toggle ${key}`} />
                  </div>
                ))}
              </div>
            </div>

            {saveStatus === 'success' && <p className="ml-7 rounded-lg border border-success/30 bg-success-subtle p-3 text-body-sm text-success">Settings saved.</p>}
            {saveStatus === 'error' && <p className="ml-7 rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">Couldn&apos;t save your settings. Please try again.</p>}

            <div className="border-t border-border pt-6">
              <div className="mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-foreground-muted" />
                <h3 className="text-title-md text-foreground">Account</h3>
              </div>
              <div className="ml-7 space-y-4">
                <div>
                  <button
                    onClick={() => { setShowPasswordForm((v) => !v); setPasswordStatus('idle'); setPasswordError(''); }}
                    className="text-body-sm font-medium text-accent hover:text-accent-hover"
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-4 max-w-sm space-y-3">
                      <Input label="Current Password" type={showPasswords ? 'text' : 'password'} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      <Input label="New Password" type={showPasswords ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <Input label="Confirm New Password" type={showPasswords ? 'text' : 'password'} required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />

                      <button type="button" onClick={() => setShowPasswords((v) => !v)} className="flex items-center gap-1 text-caption text-foreground-subtle hover:text-foreground">
                        {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {showPasswords ? 'Hide' : 'Show'} passwords
                      </button>

                      {passwordError && <p className="text-body-sm text-danger">{passwordError}</p>}
                      {passwordStatus === 'success' && <p className="text-body-sm text-success">Password changed successfully.</p>}

                      <Button type="submit" size="sm" loading={passwordChanging}>{passwordChanging ? 'Changing...' : 'Update Password'}</Button>
                    </form>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteStatus === 'success'}
                    className="text-body-sm font-medium text-danger hover:text-danger/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete Account
                  </button>
                  {deleteStatus === 'success' && (
                    <p className="mt-2 text-body-sm text-success">Deletion request submitted. Our staff will review it and follow up with you by email.</p>
                  )}
                  {deleteStatus === 'error' && (
                    <p className="mt-2 text-body-sm text-danger">Couldn&apos;t submit your deletion request. Please try again or contact us directly.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <Button loading={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Settings'}</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        consequence="This submits a request to permanently delete your account and data. It doesn't happen instantly — our staff review every request and will follow up with you by email before anything is removed."
        confirmLabel="Request Deletion"
        destructive
        onConfirm={handleDeleteAccount}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </Container>
  );
}
