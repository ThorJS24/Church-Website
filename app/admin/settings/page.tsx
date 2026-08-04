'use client';

import { useEffect, useState } from 'react';
import { Save, Download } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, ErrorState } from '@/components/admin/States';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

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
    <Card>
      <div className="space-y-4">
        {FEATURE_FLAGS.map((flag) => (
          <Checkbox
            key={flag.key}
            label={flag.label}
            description={flag.description}
            checked={flags[flag.key] ?? true}
            onChange={(e) => setFlags({ ...flags, [flag.key]: e.target.checked })}
          />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button leftIcon={<Save className="h-4 w-4" />} loading={saving} onClick={save}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && <span className="text-body-sm text-success">Saved</span>}
      </div>
    </Card>
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
    <Card>
      <p className="mb-4 text-body-sm text-foreground-muted">
        Download every content collection (sermons, events, pastors, blog posts, etc.) as one JSON file.
        Does not include member accounts or the audit log.
      </p>
      <Button leftIcon={<Download className="h-4 w-4" />} loading={exporting} onClick={exportBackup}>
        {exporting ? 'Exporting...' : 'Export All Content as JSON'}
      </Button>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-headline-md text-foreground">Settings</h1>

      <div className="mb-10">
        <h2 className="mb-4 text-title-lg text-foreground">Feature Toggles</h2>
        <FeatureToggles />
      </div>

      <div className="mb-10">
        <GenericContentTab type="services" label="Service Times" fields={SERVICE_FIELDS} columns={['title', 'time', 'location']} />
      </div>

      <div>
        <h2 className="mb-4 text-title-lg text-foreground">Backup</h2>
        <BackupSection />
      </div>
    </div>
  );
}
