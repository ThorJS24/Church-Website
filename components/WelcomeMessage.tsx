'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

interface WelcomeMessageProps {
  user: {
    name: string;
    email?: string;
  };
}

const WelcomeMessage = ({ user }: WelcomeMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const blessings = [
    "May God's peace be with you today and always.",
    "Blessed are you in the name of the Lord.",
    "May the Lord bless you and keep you safe.",
    "God's grace and mercy be upon you.",
    "May you find strength and comfort in His love."
  ];

  const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-4"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user.name}!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
            "{randomBlessing}"
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We're blessed to have you in our church family.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeMessage;