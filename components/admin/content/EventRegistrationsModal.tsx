'use client';

import { useEffect, useState } from 'react';
import { Users2, AlertTriangle } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { LoadingState, EmptyState } from '@/components/admin/States';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface Registration { id: string; name: string; email: string; headcount: number; status: string; createdAt?: string }
interface Summary { confirmedHeadcount: number; waitlistedHeadcount: number; confirmedCount: number; waitlistedCount: number }

export default function EventRegistrationsModal({
  eventId, eventTitle, isOpen, onClose,
}: {
  eventId: string | null;
  eventTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !eventId) return;
    setLoading(true);
    adminFetch(`/api/admin/events/${eventId}/registrations`)
      .then((data) => { setRegistrations(data.registrations); setSummary(data.summary); })
      .catch((err) => toast({ title: 'Failed to load registrations', description: err.message, variant: 'danger' }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventId]);

  const sendCancelBroadcast = async () => {
    if (!eventId) return;
    setBroadcasting(true);
    try {
      const data = await adminFetch(`/api/admin/events/${eventId}/cancel-broadcast`, { method: 'POST', body: JSON.stringify({ message }) });
      toast({ title: `Cancellation sent to ${data.notified} of ${data.totalRecipients} registrants`, variant: 'success' });
      setShowCancelConfirm(false);
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to send cancellation', description: err.message, variant: 'danger' });
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Registrations: ${eventTitle || ''}`} size="lg">
        {loading ? (
          <LoadingState label="Loading registrations..." />
        ) : registrations.length === 0 ? (
          <EmptyState icon={Users2} title="No registrations yet" />
        ) : (
          <div>
            {summary && (
              <div className="mb-4 flex gap-3">
                <Badge variant="success">{summary.confirmedHeadcount} confirmed ({summary.confirmedCount} {summary.confirmedCount === 1 ? 'RSVP' : 'RSVPs'})</Badge>
                {summary.waitlistedCount > 0 && <Badge variant="warning">{summary.waitlistedHeadcount} waitlisted ({summary.waitlistedCount})</Badge>}
              </div>
            )}
            <ul className="mb-6 max-h-72 space-y-2 overflow-y-auto">
              {registrations.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-body-sm">
                  <div>
                    <p className="font-medium text-foreground">{r.name} <span className="text-foreground-subtle">({r.headcount})</span></p>
                    <p className="text-caption text-foreground-subtle">{r.email}</p>
                  </div>
                  <Badge variant={r.status === 'confirmed' ? 'success' : r.status === 'waitlisted' ? 'warning' : 'neutral'}>{r.status}</Badge>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-danger">
                <AlertTriangle className="h-4 w-4" /> Cancel event & notify all registrants
              </p>
              <Textarea label="Optional message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add any details for registrants..." />
              <Button variant="danger" className="mt-3" onClick={() => setShowCancelConfirm(true)}>Cancel Event & Send Notice</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Cancel this event?"
        consequence={`This marks the event cancelled and emails every confirmed and waitlisted registrant${summary ? ` (${summary.confirmedCount + summary.waitlistedCount} ${summary.confirmedCount + summary.waitlistedCount === 1 ? 'person' : 'people'})` : ''}. This cannot be undone.`}
        confirmLabel={broadcasting ? 'Sending...' : 'Cancel Event & Notify'}
        onConfirm={sendCancelBroadcast}
        onClose={() => setShowCancelConfirm(false)}
      />
    </>
  );
}
