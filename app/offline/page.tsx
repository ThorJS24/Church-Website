'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Container size="sm" className="flex min-h-[70vh] items-center justify-center text-center">
      <div className="w-full max-w-md">
        <WifiOff className="mx-auto mb-4 h-20 w-20 text-foreground-subtle" />
        <h1 className="text-headline-sm text-foreground">You&apos;re Offline</h1>
        <p className="mt-2 text-body-md text-foreground-muted">Please check your internet connection and try again.</p>

        {isOnline && (
          <Button className="mt-6" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => window.location.reload()}>
            Retry
          </Button>
        )}

        <Card className="mt-8 text-left">
          <h2 className="text-title-sm text-foreground">Cached Content Available</h2>
          <p className="mt-2 text-body-sm text-foreground-muted">Some content may still be available offline. Navigate using the menu above.</p>
        </Card>
      </div>
    </Container>
  );
}
