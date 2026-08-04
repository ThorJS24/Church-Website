'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  /** The specific consequence, spelled out — not a generic "Are you sure?" */
  consequence: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  consequence,
  confirmLabel = 'Confirm',
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <span className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${destructive ? 'bg-danger-subtle' : 'bg-accent-subtle'}`}>
            <AlertTriangle className={`h-4 w-4 ${destructive ? 'text-danger' : 'text-accent'}`} />
          </span>
          {title}
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={handleConfirm} loading={submitting}>
            {submitting ? 'Working...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-foreground-muted">{consequence}</p>
    </Modal>
  );
}
