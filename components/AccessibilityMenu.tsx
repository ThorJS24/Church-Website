'use client';

import { Type, Contrast } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { IconButton } from '@/components/ui/icon-button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const TEXT_SIZES = [
  { value: 'normal' as const, label: 'A', className: 'text-sm' },
  { value: 'large' as const, label: 'A', className: 'text-base' },
  { value: 'larger' as const, label: 'A', className: 'text-lg' },
];

export function AccessibilityMenu() {
  const a11y = useAccessibility();
  if (!a11y) return null;
  const { textSize, setTextSize, highContrast, toggleHighContrast } = a11y;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label="Accessibility settings">
          <Type />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel className="px-0">Text size</DropdownMenuLabel>
        <div className="mb-3 flex gap-2">
          {TEXT_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setTextSize(size.value)}
              aria-pressed={textSize === size.value}
              className={cn(
                'flex h-10 flex-1 items-center justify-center rounded-md border font-serif transition-colors',
                size.className,
                textSize === size.value
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-border text-foreground-muted hover:border-border-strong hover:text-foreground'
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <div className="mt-3 flex items-center justify-between">
          <label htmlFor="high-contrast-toggle" className="flex items-center gap-2 text-body-sm text-foreground">
            <Contrast className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
            High contrast
          </label>
          <Switch id="high-contrast-toggle" checked={highContrast} onChange={toggleHighContrast} label="Toggle high contrast" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
