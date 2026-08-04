import Image from 'next/image';
import { cn } from '@/lib/cn';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-caption',
  sm: 'h-8 w-8 text-caption',
  md: 'h-10 w-10 text-body-sm',
  lg: 'h-14 w-14 text-title-sm',
  xl: 'h-20 w-20 text-title-lg',
};

const SIZE_PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle font-medium text-accent',
        SIZE_CLASSES[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? 'Avatar'}
          width={SIZE_PX[size]}
          height={SIZE_PX[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}
