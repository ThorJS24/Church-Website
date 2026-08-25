'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/states';
import { useToast } from '@/lib/toast';

export default function ProfilePage() {
  const { user, isLoading, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', address: '', dateOfBirth: '', interests: [] as string[] });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        interests: user.interests || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateUser(formData);
      if (success) {
        setIsEditing(false);
        toast({ title: 'Profile updated successfully!', variant: 'success' });
      } else {
        toast({ title: 'Failed to update profile', variant: 'danger' });
      }
    } catch {
      toast({ title: 'An error occurred while updating profile', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !user) return <LoadingState />;

  const completenessFields: { label: string; done: boolean }[] = [
    { label: 'name', done: !!(formData.firstName && formData.lastName) },
    { label: 'photo', done: !!user.photoURL },
    { label: 'phone', done: !!formData.phone },
    { label: 'address', done: !!formData.address },
    { label: 'date of birth', done: !!formData.dateOfBirth },
  ];
  const completenessPercent = Math.round((completenessFields.filter((f) => f.done).length / completenessFields.length) * 100);
  const missingFields = completenessFields.filter((f) => !f.done).map((f) => f.label);

  return (
    <Container size="lg" className="py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Identity rail + editable fields side by side — not one mega-card
            with a colored banner. The rail carries identity/status (who you
            are); the main column carries the editable data (what you can
            change) — two different jobs, two different visual treatments. */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-6 text-center">
              <Avatar src={user.photoURL} name={`${formData.firstName} ${formData.lastName}`.trim() || user.email} size="xl" />
              <h1 className="mt-4 font-serif text-title-lg text-foreground">{formData.firstName} {formData.lastName}</h1>
              <p className="text-body-sm text-foreground-muted">{user.email}</p>
              <Badge variant="success" className="mt-3 capitalize">{user.membershipStatus || 'Member'}</Badge>

              {completenessPercent < 100 && (
                <div className="mt-5 w-full border-t border-border pt-4 text-left">
                  <div className="mb-1.5 flex items-center justify-between text-caption">
                    <span className="font-medium text-foreground">Profile {completenessPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-active">
                    <div className="h-full rounded-full bg-accent transition-all duration-slow ease-standard" style={{ width: `${completenessPercent}%` }} />
                  </div>
                  <p className="mt-1.5 text-caption text-foreground-subtle">Add your {missingFields.slice(0, 2).join(' and ')}{missingFields.length > 2 ? ', and more' : ''}</p>
                </div>
              )}

              <div className="mt-5 flex w-full gap-2">
                <Button variant="secondary" size="sm" fullWidth leftIcon={isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />} onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <Button variant="danger" size="sm" fullWidth leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface p-6 text-body-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Member Since</span>
                <span className="text-foreground">{new Date(user.joinDate || user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Role</span>
                <span className="capitalize text-foreground">{user.role || 'Member'}</span>
              </div>
            </div>
          </div>

          <div>
            <Card padding="lg">
              <h3 className="mb-4 text-title-md text-foreground">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 shrink-0 text-foreground-subtle" />
                  {isEditing ? (
                    <div className="flex flex-1 gap-2">
                      <Input placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                      <Input placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  ) : (
                    <span className="text-body-sm text-foreground-muted">{formData.firstName} {formData.lastName}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-foreground-subtle" />
                  <span className="text-body-sm text-foreground-muted">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-foreground-subtle" />
                  {isEditing ? (
                    <Input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="flex-1" />
                  ) : (
                    <span className="text-body-sm text-foreground-muted">{formData.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-foreground-subtle" />
                  {isEditing ? (
                    <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="flex-1" />
                  ) : (
                    <span className="text-body-sm text-foreground-muted">{formData.address || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 shrink-0 text-foreground-subtle" />
                  {isEditing ? (
                    <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="flex-1" />
                  ) : (
                    <span className="text-body-sm text-foreground-muted">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <Button leftIcon={!saving ? <Save className="h-4 w-4" /> : undefined} loading={saving} onClick={handleSave}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </Card>

            <Card padding="lg" className="mt-6">
              <h3 className="mb-4 text-title-md text-foreground">Church Involvement</h3>
              {formData.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <span key={index} className="rounded-full bg-accent-subtle px-3 py-1.5 text-body-sm text-accent">{interest}</span>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-foreground-subtle">No interests selected</p>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
