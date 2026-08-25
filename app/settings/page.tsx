'use client';

import { useState, useEffect, type ElementType, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Bell, Shield, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LoadingState } from '@/components/ui/states';

type Notifications = { email: boolean; events: boolean; prayers: boolean; newsletter: boolean; sermons: boolean; volunteerOpportunities: boolean };
type Privacy = { profileVisible: boolean; contactVisible: boolean };

const NOTIFICATION_COPY: Record<keyof Notifications, { label: string; description: string }> = {
  email: { label: 'Email', description: 'Account notifications and important updates.' },
  events: { label: 'Events', description: 'Upcoming church events and activities.' },
  prayers: { label: 'Prayer Requests', description: 'Updates on prayer requests you follow.' },
  newsletter: { label: 'Newsletter', description: 'Our periodic church newsletter.' },
  sermons: { label: 'Sermons', description: 'New sermon and message uploads.' },
  volunteerOpportunities: { label: 'Volunteer Opportunities', description: 'Openings to serve and volunteer.' },
};

const PRIVACY_COPY: Record<keyof Privacy, { label: string; description: string }> = {
  profileVisible: { label: 'Profile Visibility', description: 'Allow other members to find and view your profile.' },
  contactVisible: { label: 'Contact Visibility', description: 'Show your contact information to other members.' },
};

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card variant="flat" padding="none" className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <h2 className="text-title-sm text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-body-sm text-foreground-muted">{description}</p>}
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div className="min-w-0 pr-4">
        <p className="text-body-md font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-body-sm text-foreground-muted">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={`Toggle ${label}`} className="shrink-0" />
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading, updateUser, changePassword } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notifications>({ email: true, events: true, prayers: true, newsletter: true, sermons: false, volunteerOpportunities: false });
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
        newsletter: user.notificationPreferences?.newsletter ?? true,
        sermons: user.notificationPreferences?.sermons ?? false,
        volunteerOpportunities: user.notificationPreferences?.volunteerOpportunities ?? false,
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
    <Container size="sm" className="py-12 md:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <header>
          <h1 className="font-serif text-headline-sm text-foreground">Settings</h1>
          <p className="mt-1 text-body-sm text-foreground-muted">Manage your notifications, privacy, and account.</p>
        </header>

        <SettingsSection icon={Bell} title="Communication Preferences" description="Choose what you'd like to hear from us about.">
          {(Object.entries(notifications) as [keyof Notifications, boolean][]).map(([key, value]) => (
            <SettingRow
              key={key}
              label={NOTIFICATION_COPY[key].label}
              description={NOTIFICATION_COPY[key].description}
              checked={value}
              onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
            />
          ))}
        </SettingsSection>

        <SettingsSection icon={Shield} title="Privacy">
          {(Object.entries(privacy) as [keyof Privacy, boolean][]).map(([key, value]) => (
            <SettingRow
              key={key}
              label={PRIVACY_COPY[key].label}
              description={PRIVACY_COPY[key].description}
              checked={value}
              onChange={() => setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))}
            />
          ))}
        </SettingsSection>

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
          {saveStatus === 'success' && <p className="text-body-sm text-success">Settings saved.</p>}
          {saveStatus === 'error' && <p className="text-body-sm text-danger">Couldn&apos;t save your settings. Please try again.</p>}
          <Button loading={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>

        <SettingsSection icon={UserIcon} title="Account">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0 pr-4">
                <p className="text-body-md font-medium text-foreground">Password</p>
                <p className="mt-0.5 text-body-sm text-foreground-muted">Update the password you use to sign in.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => { setShowPasswordForm((v) => !v); setPasswordStatus('idle'); setPasswordError(''); }}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 max-w-sm space-y-3 border-t border-border pt-4">
                <Input label="Current Password" type={showPasswords ? 'text' : 'password'} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <Input label="New Password" type={showPasswords ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input label="Confirm New Password" type={showPasswords ? 'text' : 'password'} required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />

                <button type="button" onClick={() => setShowPasswords((v) => !v)} className="flex items-center gap-1 border-0 bg-transparent p-0 text-caption text-foreground-subtle hover:text-foreground">
                  {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPasswords ? 'Hide' : 'Show'} passwords
                </button>

                {passwordError && <p className="text-body-sm text-danger">{passwordError}</p>}
                {passwordStatus === 'success' && <p className="text-body-sm text-success">Password changed successfully.</p>}

                <Button type="submit" size="sm" loading={passwordChanging}>{passwordChanging ? 'Changing...' : 'Update Password'}</Button>
              </form>
            )}
          </div>

          <div className="bg-danger-subtle/40 px-5 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0 pr-4">
                <p className="text-body-md font-medium text-danger">Delete Account</p>
                <p className="mt-0.5 text-body-sm text-foreground-muted">Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="shrink-0"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteStatus === 'success'}
              >
                Delete Account
              </Button>
            </div>
            {deleteStatus === 'success' && (
              <p className="mt-3 text-body-sm text-success">Deletion request submitted. Our staff will review it and follow up with you by email.</p>
            )}
            {deleteStatus === 'error' && (
              <p className="mt-3 text-body-sm text-danger">Couldn&apos;t submit your deletion request. Please try again or contact us directly.</p>
            )}
          </div>
        </SettingsSection>
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
