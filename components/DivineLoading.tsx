'use client';

import { motion } from 'framer-motion';
import { Cross, Heart, Star } from 'lucide-react';

interface DivineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function DivineLoading({ message = "Loading...", size = 'md' }: DivineLoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const containerSizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Divine Loading Animation */}
      <div className={`relative ${containerSizes[size]} mb-4`}>
        {/* Central Cross */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Cross className={`${sizeClasses[size]} text-yellow-500`} />
        </motion.div>

        {/* Orbiting Elements */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Heart className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 text-pink-400" />
          <Star className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
          <Heart className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 text-purple-400" />
          <Star className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
        </motion.div>

        {/* Divine Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-yellow-200/30 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blessing Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * 45 * Math.PI / 180) * 30],
              y: [0, Math.sin(i * 45 * Math.PI / 180) * 30],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Loading Message */}
      <motion.p
        className="text-gray-600 dark:text-gray-400 font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.p>

      {/* Divine Blessing Text */}
      <motion.p
        className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        "Be still and know that I am God" - Psalm 46:10
      </motion.p>
    </div>
  );
}