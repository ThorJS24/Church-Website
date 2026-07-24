'use client';

import { motion } from 'framer-motion';
import { Cross, Heart, Star } from 'lucide-react';

export default function DivineEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Subtle divine glow */}
      <motion.div
        className="absolute top-10 left-1/2 w-96 h-96 bg-blue-100/5 dark:bg-blue-900/5 rounded-full transform -translate-x-1/2"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Minimal sacred symbols */}
      <motion.div className="absolute top-1/4 left-1/4 text-blue-200/10 dark:text-blue-800/10" animate={{ y: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity }}>
        <Cross className="w-3 h-3" />
      </motion.div>
      <motion.div className="absolute bottom-1/3 right-1/3 text-purple-200/10 dark:text-purple-800/10" animate={{ y: [5, -5, 5] }} transition={{ duration: 8, repeat: Infinity }}>
        <Heart className="w-3 h-3" />
      </motion.div>
    </div>
  );
}