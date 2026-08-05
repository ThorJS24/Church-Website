import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 6 | 8 | 12;
  responsive?: boolean;
}

const COLS_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

const COLS_CLASSES_FIXED: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const GAP_CLASSES: Record<number, string> = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  12: 'gap-12',
};

export function Grid({ cols = 3, gap = 6, responsive = true, className, ...props }: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        responsive ? COLS_CLASSES[cols] : COLS_CLASSES_FIXED[cols],
        GAP_CLASSES[gap],
        className
      )}
      {...props}
    />
  );
}
