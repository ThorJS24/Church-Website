'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false
}: AnimatedButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md',
    ghost: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      whileHover={!disabled ? { 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={!disabled ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : undefined}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >

      {children}
    </motion.button>
  );
}