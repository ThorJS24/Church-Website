'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
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

  return (
    <Container size="md" className="py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="raised" padding="none" className="overflow-hidden">
          <div className="flex flex-col gap-4 bg-accent px-6 py-8 text-accent-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar src={user.photoURL} name={`${formData.firstName} ${formData.lastName}`.trim() || user.email} size="xl" className="bg-white/20 text-white" />
              <div>
                <h1 className="font-serif text-headline-sm">{formData.firstName} {formData.lastName}</h1>
                <p className="opacity-90">{user.email}</p>
                <p className="text-body-sm opacity-75">Member since {new Date(user.joinDate || user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" leftIcon={isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button variant="danger" size="sm" leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          <div className="p-6">
            <Grid cols={2} gap={6}>
              <div>
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
              </div>

              <div>
                <h3 className="mb-4 text-title-md text-foreground">Church Involvement</h3>
                <div className="mb-6 space-y-2">
                  {formData.interests.length > 0 ? (
                    formData.interests.map((interest, index) => (
                      <div key={index} className="rounded-lg bg-accent-subtle px-3 py-2 text-body-sm text-accent">{interest}</div>
                    ))
                  ) : (
                    <p className="text-body-sm text-foreground-subtle">No interests selected</p>
                  )}
                </div>

                <h3 className="mb-4 text-title-md text-foreground">Membership Info</h3>
                <div className="space-y-3 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Member Since:</span>
                    <span className="text-foreground">{new Date(user.joinDate || user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Status:</span>
                    <Badge variant="success" className="capitalize">{user.membershipStatus || 'Member'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Role:</span>
                    <span className="capitalize text-foreground">{user.role || 'Member'}</span>
                  </div>
                </div>
              </div>
            </Grid>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <Button leftIcon={!saving ? <Save className="h-4 w-4" /> : undefined} loading={saving} onClick={handleSave}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Container>
  );
}
