'use client';

import { motion } from 'framer-motion';
import UnifiedContactForm from '@/components/UnifiedContactForm';

export default function ContactFormsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're here to help with all your spiritual and community needs
          </p>
        </motion.div>

        <UnifiedContactForm />
      </div>
    </div>
  );
}