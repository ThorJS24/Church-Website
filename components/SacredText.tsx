'use client';

import { ReactNode } from 'react';

interface SacredTextProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function SacredText({ 
  children, 
  className = '', 
  size = 'md'
}: SacredTextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300`}>
      {children}
    </div>
  );
}