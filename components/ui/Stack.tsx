import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 0 | 1 | 1.5 | 2 | 3 | 4 | 6 | 8 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

const GAP_CLASSES: Record<number, string> = {
  0: 'gap-0',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  12: 'gap-12',
};

const ALIGN_CLASSES = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY_CLASSES = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Stack({
  direction = 'col',
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        GAP_CLASSES[gap],
        align && ALIGN_CLASSES[align],
        justify && JUSTIFY_CLASSES[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    />
  );
}
