'use client';

import { useEffect, useState } from 'react';
import { Save, Download } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, ErrorState } from '@/components/admin/States';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';

const SERVICE_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Service Name', type: 'text', required: true },
  { key: 'time', label: 'Time (HH:MM, 24h)', type: 'text', required: true },
  { key: 'location', label: 'Location', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const FEATURE_FLAGS: { key: string; label: string; description: string }[] = [
  { key: 'livestream', label: 'Livestream', description: 'Show the live stream button/section on the site.' },
  { key: 'prayerWall', label: 'Prayer Wall', description: 'Allow visitors to submit and browse prayer requests.' },
  { key: 'gallerySubmissions', label: 'Public Gallery Submissions', description: 'Allow visitors to submit photos for the gallery (subject to moderation).' },
  { key: 'givingOnline', label: 'Online Giving', description: 'Show the online giving/donation page.' },
];

function FeatureToggles() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/settings')
      .then((data) => setFlags(data.settings?.featureFlags || {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ featureFlags: flags }) });
      setSaved(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading feature toggles..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-4">
        {FEATURE_FLAGS.map((flag) => (
          <label key={flag.key} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={flags[flag.key] ?? true}
              onChange={(e) => setFlags({ ...flags, [flag.key]: e.target.checked })}
              className="mt-1 w-4 h-4"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{flag.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{flag.description}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved</span>}
      </div>
    </div>
  );
}

function BackupSection() {
  const [exporting, setExporting] = useState(false);

  const exportBackup = async () => {
    setExporting(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Backup failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salempbc-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Download every content collection (sermons, events, pastors, blog posts, etc.) as one JSON file.
        Does not include member accounts or the audit log.
      </p>
      <button
        onClick={exportBackup}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export All Content as JSON'}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
        <FeatureToggles />
      </div>

      <div className="mb-10">
        <GenericContentTab type="services" label="Service Times" fields={SERVICE_FIELDS} columns={['title', 'time', 'location']} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup</h2>
        <BackupSection />
      </div>
    </div>
  );
}
