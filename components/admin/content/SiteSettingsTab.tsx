'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, ErrorState } from '@/components/admin/States';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FIELDS: { key: string; label: string }[] = [
  { key: 'churchName', label: 'Church Name' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'address', label: 'Address' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'youtubeChannelUrl', label: 'YouTube Channel URL' },
  { key: 'facebookUrl', label: 'Facebook URL' },
  { key: 'instagramUrl', label: 'Instagram URL' },
  { key: 'whatsappGroupUrl', label: 'WhatsApp Group URL' },
  { key: 'googleMapsUrl', label: 'Google Maps URL' },
  { key: 'givingTransparencyMinistryPercent', label: 'Giving Transparency: Ministry %' },
  { key: 'givingTransparencyOperationsPercent', label: 'Giving Transparency: Operations %' },
  { key: 'givingTransparencyMissionsPercent', label: 'Giving Transparency: Missions %' },
  { key: 'givingTransparencyBuildingPercent', label: 'Giving Transparency: Building %' },
  { key: 'givingTransparencyReportUrl', label: 'Giving Transparency: Annual Report URL' },
  { key: 'givingTransparencyNote', label: 'Giving Transparency: Note' },
];

export default function SiteSettingsTab() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch('/api/admin/settings')
      .then((data) => setForm(data.settings || {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(form) });
      setSaved(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading site settings..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h2 className="mb-4 text-title-lg text-foreground">Site Settings</h2>
      <Card>
        <Grid cols={2} gap={4}>
          {FIELDS.map((f) => (
            <Input key={f.key} label={f.label} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          ))}
        </Grid>
        <div className="mt-6 flex items-center gap-3">
          <Button leftIcon={<Save className="h-4 w-4" />} loading={saving} onClick={save}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {saved && <span className="text-body-sm text-success">Saved</span>}
        </div>
      </Card>
    </div>
  );
}
