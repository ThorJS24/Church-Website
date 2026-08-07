import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-3 text-title-sm font-medium text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        Loading...
      </div>
    </div>
  );
}
