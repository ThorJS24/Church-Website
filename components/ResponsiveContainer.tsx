'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`container-responsive ${className}`}>
      {children}
    </div>
  );
}