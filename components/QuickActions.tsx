'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Church, Heart, Mail } from 'lucide-react'

const QuickActions = () => {
  const actions = [
    {
      icon: Church,
      title: 'Join Us Sunday',
      description: 'Worship with us every Sunday at 10:00 AM',
      href: '/services',
    },
    {
      icon: Heart,
      title: 'Give Online',
      description: 'Support our mission with a secure donation',
      href: '/give',
    },
    {
      icon: Heart,
      title: 'Prayer Request',
      description: 'Share your prayer needs with our community',
      href: '/prayer',
    },
    {
      icon: Mail,
      title: 'Get In Touch',
      description: 'Contact us with questions or to learn more',
      href: '/contact',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Connect With Us</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={action.href} className="block group">
                <div className="card p-8 text-center h-full relative overflow-hidden">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <action.icon className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{action.title}</h3>
                  <p className="text-gray-600 mb-6">{action.description}</p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuickActions