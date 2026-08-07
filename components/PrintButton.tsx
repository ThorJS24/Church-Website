'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <Button variant="secondary" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
      {label}
    </Button>
  );
}
