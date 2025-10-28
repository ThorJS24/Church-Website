'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'

const Location = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Us</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Grace Community Church</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600 w-5 h-5" />
                <span className="text-gray-700">Connaught Place, New Delhi, India 110001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-blue-600 w-5 h-5" />
                <span className="text-gray-700">+91 11 2341 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-600 w-5 h-5" />
                <span className="text-gray-700">info@gracecommunity.org</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="h-80 bg-gray-200 rounded-lg overflow-hidden"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.674994842842!2d77.20902731508236!3d28.65195908240251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd158142f6c7%3A0x8b8b8b8b8b8b8b8b!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1234567890123"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Location