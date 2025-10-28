'use client';

import { motion } from 'framer-motion';
import { Cross, Heart, Star } from 'lucide-react';

export default function DivineEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Subtle divine glow */}
      <motion.div
        className="absolute top-10 left-1/2 w-96 h-96 bg-gradient-radial from-yellow-200/10 to-transparent rounded-full transform -translate-x-1/2"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating sacred symbols - reduced count */}
      <motion.div className="absolute top-1/4 left-1/4 text-yellow-300/20" animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }}>
        <Cross className="w-4 h-4" />
      </motion.div>
      <motion.div className="absolute top-1/3 right-1/4 text-pink-300/20" animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity }}>
        <Heart className="w-4 h-4" />
      </motion.div>
      <motion.div className="absolute bottom-1/3 left-1/3 text-blue-300/20" animate={{ y: [-5, 15, -5] }} transition={{ duration: 6, repeat: Infinity }}>
        <Star className="w-4 h-4" />
      </motion.div>
    </div>
  );
}