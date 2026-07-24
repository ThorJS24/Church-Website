'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Shield, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import ConfirmModal from '@/components/admin/ConfirmModal';

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

  const handleToggleNotification = (key: keyof Notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePrivacy = (key: keyof Privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const success = await updateUser({
        notificationPreferences: notifications,
        privacyPreferences: privacy,
      });
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
      setPasswordError(
        code === 'auth/wrong-password' || code === 'auth/invalid-credential'
          ? 'Current password is incorrect.'
          : 'Could not change your password. Please try again.'
      );
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteStatus('idle');
    try {
      const token = await getIdToken();
      const response = await fetch('/api/privacy/delete-account', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      setDeleteStatus(data.success ? 'success' : 'error');
    } catch {
      setDeleteStatus('error');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Notifications */}
            <div>
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="space-y-3 ml-7">
                {(Object.entries(notifications) as [keyof Notifications, boolean][]).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button
                      onClick={() => handleToggleNotification(key)}
                      aria-pressed={value}
                      aria-label={`Toggle ${key} notifications`}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h3>
              </div>
              <div className="space-y-3 ml-7">
                {(Object.entries(privacy) as [keyof Privacy, boolean][]).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button
                      onClick={() => handleTogglePrivacy(key)}
                      aria-pressed={value}
                      aria-label={`Toggle ${key}`}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {saveStatus === 'success' && (
              <div className="ml-7 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-300 text-sm">Settings saved.</p>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="ml-7 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">Couldn&apos;t save your settings. Please try again.</p>
              </div>
            )}

            {/* Account */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <UserIcon className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h3>
              </div>
              <div className="ml-7 space-y-4">
                <div>
                  <button
                    onClick={() => { setShowPasswordForm(v => !v); setPasswordStatus('idle'); setPasswordError(''); }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-3 max-w-sm">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          id="currentPassword"
                          type={showPasswords ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type={showPasswords ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmNewPassword"
                          type={showPasswords ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPasswords(v => !v)}
                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPasswords ? 'Hide' : 'Show'} passwords
                      </button>

                      {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
                      {passwordStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400">Password changed successfully.</p>}

                      <button
                        type="submit"
                        disabled={passwordChanging}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
                      >
                        {passwordChanging ? 'Changing...' : 'Update Password'}
                      </button>
                    </form>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteStatus === 'success'}
                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Account
                  </button>
                  {deleteStatus === 'success' && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Deletion request submitted. Our staff will review it and follow up with you by email.
                    </p>
                  )}
                  {deleteStatus === 'error' && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Couldn&apos;t submit your deletion request. Please try again or contact us directly.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        consequence="This submits a request to permanently delete your account and data. It doesn't happen instantly — our staff review every request and will follow up with you by email before anything is removed."
        confirmLabel="Request Deletion"
        destructive
        onConfirm={handleDeleteAccount}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
