'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, Download, Upload, Palette, ShieldCheck, LinkIcon, Activity, AlertTriangle, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { getIdToken } from '@/lib/firebase';
import { LoadingState, ErrorState, EmptyState } from '@/components/admin/States';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';
import { useToast } from '@/lib/toast';
import { UserRole, Permission, getUserPermissions } from '@/lib/permissions';
import { deriveAccentShades, isValidHexColor } from '@/lib/colorTheme';

const SERVICE_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Service Name', type: 'text', required: true },
  { key: 'time', label: 'Time (HH:MM, 24h)', type: 'text', required: true },
  { key: 'location', label: 'Location', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'accessibilityInfo', label: 'Accessibility & Accommodations (e.g. wheelchair access, hearing loop, ASL interpreter)', type: 'textarea' },
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
  const [restoring, setRestoring] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const runRestore = async () => {
    if (!pendingFile || confirmText !== 'RESTORE') return;
    setRestoring(true);
    try {
      const text = await pendingFile.text();
      const parsed = JSON.parse(text);
      const data = await adminFetch('/api/admin/backup/restore', { method: 'POST', body: JSON.stringify(parsed) });
      toast({ title: `Restored ${data.totalDocs} document(s)`, description: Object.entries(data.summary).map(([k, v]) => `${k}: ${v}`).join(', '), variant: 'success' });
      setPendingFile(null);
      setConfirmText('');
    } catch (err: any) {
      toast({ title: 'Restore failed', description: err.message, variant: 'danger' });
    } finally {
      setRestoring(false);
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

      <div className="mt-6 border-t border-border pt-6">
        <p className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-danger"><AlertTriangle className="h-4 w-4" /> Restore from backup (super admin only)</p>
        <p className="mb-4 text-body-sm text-foreground-muted">
          Overwrites live content with the contents of a backup JSON file, collection by collection. This cannot be undone —
          export a fresh backup first if you want to keep the current state.
        </p>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)} />
        {!pendingFile ? (
          <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
            Choose Backup File...
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-danger/30 bg-danger-subtle p-4">
            <p className="text-body-sm text-foreground">Selected: <strong>{pendingFile.name}</strong></p>
            <Input
              label={'Type RESTORE to confirm'}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESTORE"
            />
            <div className="flex items-center gap-2">
              <Button variant="danger" disabled={confirmText !== 'RESTORE'} loading={restoring} onClick={runRestore}>
                {restoring ? 'Restoring...' : 'Restore Now'}
              </Button>
              <Button variant="secondary" onClick={() => { setPendingFile(null); setConfirmText(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const DEFAULT_ACCENT = '#1D3557';

function ThemeCustomizer() {
  const [color, setColor] = useState(DEFAULT_ACCENT);
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then((data) => { const c = data.settings?.themeAccentColor || DEFAULT_ACCENT; setColor(c); setSaved(c); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!isValidHexColor(color)) {
      toast({ title: `Enter a valid hex color, e.g. ${DEFAULT_ACCENT}`, variant: 'danger' });
      return;
    }
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ themeAccentColor: color }) });
      setSaved(color);
      toast({ title: 'Accent color saved', description: 'Visitors will see it on their next page load.', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Failed to save', description: err.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading theme..." />;

  const preview = isValidHexColor(color) ? deriveAccentShades(color, false) : null;

  return (
    <Card>
      <p className="mb-4 text-body-sm text-foreground-muted">
        Override the site&apos;s default deep-navy primary brand color with your own. Used for links, buttons, and
        highlights across the public site and this admin panel — the warm gold secondary accent stays fixed.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-label text-foreground">Primary brand color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={isValidHexColor(color) ? color : DEFAULT_ACCENT} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border border-border" aria-label="Primary brand color picker" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="w-32 font-mono" aria-label="Primary brand color hex value" />
          </div>
        </div>
        {preview && (
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-3 py-2 text-body-sm font-medium"
              style={{ backgroundColor: `rgb(${preview.accent})`, color: `rgb(${preview.accentForeground})` }}
            >
              Preview button
            </span>
            <span className="rounded-md px-3 py-2 text-body-sm font-medium" style={{ backgroundColor: `rgb(${preview.accentSubtle})`, color: `rgb(${preview.accent})` }}>
              Subtle badge
            </span>
          </div>
        )}
        <Button leftIcon={<Save className="h-4 w-4" />} loading={saving} disabled={color === saved} onClick={save}>
          {saving ? 'Saving...' : 'Save Brand Color'}
        </Button>
      </div>
    </Card>
  );
}

const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.MODERATE]: 'Moderate submissions',
  [Permission.MANAGE_CONTENT]: 'Manage content',
  [Permission.MANAGE_SETTINGS]: 'Manage settings',
  [Permission.MANAGE_USERS]: 'Manage members',
  [Permission.MANAGE_ROLES]: 'Change roles',
  [Permission.VIEW_AUDIT_LOG]: 'View audit log',
};

function RolePermissionMatrix() {
  const roles = Object.values(UserRole);
  const permissions = Object.values(Permission);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface">
            <tr>
              <th className="p-3 text-label text-foreground-subtle">Permission</th>
              {roles.map((role) => (
                <th key={role} className="p-3 text-center text-label text-foreground-subtle">{role.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm} className="border-t border-border">
                <td className="p-3 text-foreground">{PERMISSION_LABELS[perm]}</td>
                {roles.map((role) => {
                  const has = getUserPermissions(role).includes(perm);
                  return (
                    <td key={role} className="p-3 text-center">
                      {has ? <CheckCircle2 className="mx-auto h-4 w-4 text-success" /> : <span className="text-foreground-subtle">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface NotFoundHit { id: string; path: string; count: number; lastSeenAt?: string; firstSeenAt?: string }

function NotFoundReport() {
  const [hits, setHits] = useState<NotFoundHit[] | null>(null);
  const { toast } = useToast();

  const load = () => {
    adminFetch('/api/admin/not-found-report').then((data) => setHits(data.hits)).catch(() => setHits([]));
  };
  useEffect(load, []);

  const dismiss = async (hit: NotFoundHit) => {
    try {
      await adminFetch(`/api/admin/not-found-report/${hit.id}`, { method: 'DELETE' });
      setHits((prev) => (prev ? prev.filter((h) => h.id !== hit.id) : prev));
    } catch (err: any) {
      toast({ title: 'Failed to dismiss', description: err.message, variant: 'danger' });
    }
  };

  if (hits === null) return <LoadingState label="Loading 404 report..." />;

  return (
    <Card padding="none" className="overflow-hidden">
      {hits.length === 0 ? (
        <div className="p-6"><EmptyState icon={LinkIcon} title="No broken links seen yet" description="Visitor 404s will show up here so you can add a redirect." /></div>
      ) : (
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface">
            <tr>
              <th className="p-3 text-label text-foreground-subtle">Path</th>
              <th className="p-3 text-label text-foreground-subtle">Hits</th>
              <th className="p-3 text-label text-foreground-subtle">Last seen</th>
              <th className="p-3 text-label text-foreground-subtle" />
            </tr>
          </thead>
          <tbody>
            {hits.map((hit) => (
              <tr key={hit.id} className="border-t border-border">
                <td className="p-3 font-mono text-foreground">{hit.path}</td>
                <td className="p-3 text-foreground-muted">{hit.count}</td>
                <td className="p-3 text-foreground-muted">{hit.lastSeenAt ? new Date(hit.lastSeenAt).toLocaleString() : '—'}</td>
                <td className="p-3 text-right">
                  <IconButton label="Dismiss" size="sm" onClick={() => dismiss(hit)}><Trash2 className="h-3.5 w-3.5 text-danger" /></IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function SystemHealth() {
  const [data, setData] = useState<{ checks: any[]; counts: Record<string, number>; checkedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/system-health').then(setData).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading && !data) return <LoadingState label="Running health checks..." />;
  if (!data) return null;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-caption text-foreground-subtle">Checked {new Date(data.checkedAt).toLocaleTimeString()}</p>
        <Button variant="outline" size="sm" leftIcon={<Activity className="h-3.5 w-3.5" />} onClick={load} loading={loading}>Recheck</Button>
      </div>
      <ul className="mb-6 space-y-2">
        {data.checks.map((check) => (
          <li key={check.name} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              {check.status === 'ok' ? <CheckCircle2 className="h-4 w-4 text-success" /> : check.status === 'warning' ? <AlertTriangle className="h-4 w-4 text-warning" /> : <XCircle className="h-4 w-4 text-danger" />}
              <span className="text-body-sm font-medium text-foreground">{check.name}</span>
            </div>
            <span className="text-caption text-foreground-subtle">{check.detail}</span>
          </li>
        ))}
      </ul>
      <p className="mb-2 text-label text-foreground-subtle">Collection counts</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Object.entries(data.counts).map(([name, count]) => (
          <div key={name} className="rounded-lg border border-border p-3 text-center">
            <p className="text-title-lg text-foreground">{count}</p>
            <p className="text-caption text-foreground-subtle">{name}</p>
          </div>
        ))}
      </div>
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
        <h2 className="mb-4 flex items-center gap-2 text-title-lg text-foreground"><Palette className="h-5 w-5" /> Theme</h2>
        <ThemeCustomizer />
      </div>

      <div className="mb-10">
        <GenericContentTab type="services" label="Service Times" fields={SERVICE_FIELDS} columns={['title', 'time', 'location']} />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-title-lg text-foreground"><ShieldCheck className="h-5 w-5" /> Role Permissions</h2>
        <RolePermissionMatrix />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-title-lg text-foreground"><LinkIcon className="h-5 w-5" /> 404 / Broken Link Report</h2>
        <NotFoundReport />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-title-lg text-foreground"><Activity className="h-5 w-5" /> System Health</h2>
        <SystemHealth />
      </div>

      <div>
        <h2 className="mb-4 text-title-lg text-foreground">Backup</h2>
        <BackupSection />
      </div>
    </div>
  );
}
