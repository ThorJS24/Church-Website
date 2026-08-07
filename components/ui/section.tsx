import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Container, type ContainerProps } from './container';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'none';
  containerSize?: ContainerProps['size'];
  bleed?: boolean;
}

const SPACING_CLASSES = {
  none: '',
  sm: 'py-section-sm',
  md: 'py-section-md',
  lg: 'py-section-lg',
};

export function Section({
  spacing = 'md',
  containerSize = 'lg',
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(SPACING_CLASSES[spacing], className)} {...props}>
      {bleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  );
}
