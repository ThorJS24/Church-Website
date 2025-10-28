'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface DivineButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'prayer';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function DivineButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}: DivineButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 focus:ring-yellow-400 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-400 shadow-lg hover:shadow-xl',
    prayer: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 focus:ring-purple-400 shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}