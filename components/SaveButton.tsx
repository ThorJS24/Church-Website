'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

interface SaveButtonProps {
  itemType: 'sermon' | 'blog';
  itemId: string;
  title: string;
  url: string;
  className?: string;
}

export function SaveButton({ itemType, itemId, title, url, className }: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/member/saved', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setSaved(data.items.some((i: any) => i.itemType === itemType && i.itemId === itemId));
      }
    })();
  }, [user, itemType, itemId]);

  if (!user) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (saved) {
        await fetch('/api/member/saved', { method: 'DELETE', headers, body: JSON.stringify({ itemType, itemId }) });
        setSaved(false);
      } else {
        await fetch('/api/member/saved', { method: 'POST', headers, body: JSON.stringify({ itemType, itemId, title, url }) });
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className={className}
      loading={loading}
      leftIcon={saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
      onClick={toggle}
    >
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
