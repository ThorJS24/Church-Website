'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-bg"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {process.env.NEXT_PUBLIC_CHURCH_NAME || 'Salem Primitive Baptist Church'}
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 opacity-90"
        >
          Where faith meets community, and hope comes alive
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link href="/services" className="btn-primary">
            Join Us Sunday
          </Link>
          <Link href="/about" className="btn-outline">
            Learn More
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-8 justify-center"
        >
          <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md rounded-lg px-6 py-4">
            <Clock className="text-yellow-400 w-6 h-6" />
            <div>
              <div className="font-semibold">Sunday Service</div>
              <div className="text-sm opacity-80">10:00 AM</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-md rounded-lg px-6 py-4">
            <MapPin className="text-yellow-400 w-6 h-6" />
            <div>
              <div className="font-semibold">Salem, Tamil Nadu</div>
              <div className="text-sm opacity-80">Chinnathirupathi</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero