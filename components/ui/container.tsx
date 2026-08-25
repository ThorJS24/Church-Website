import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const SIZE_CLASSES = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  // lg is the default, used by nearly every <Section> sitewide — widened
  // from 1280px so it actually fills common 1440-1920px desktop viewports
  // instead of leaving large idle side margins. sm/md stay narrow on
  // purpose for prose-heavy pages (forms, articles, settings).
  lg: 'max-w-[1680px]',
  xl: 'max-w-[1920px]',
  full: 'max-w-none',
};

export function Container({ size = 'lg', className, ...props }: ContainerProps) {
  // Capped at lg:px-8 (2rem) rather than growing further at xl — a bigger
  // side gutter on wide screens fights the point of widening max-w above,
  // and reads as a large margin rather than the small one this site wants.
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZE_CLASSES[size], className)} {...props} />
  );
}
