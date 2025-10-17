'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, Heart } from 'lucide-react'

const Stats = () => {
  const stats = [
    { icon: Users, number: '500+', label: 'Members' },
    { icon: Heart, number: '15+', label: 'Ministries' },
    { icon: Calendar, number: '25+', label: 'Years Serving' },
    { icon: Heart, number: '1000+', label: 'Lives Touched' },
  ]

  return (
    <section className="py-16 gradient-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <stat.icon className="w-12 h-12 md:w-16 md:h-16 mb-4 mx-auto opacity-90" />
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats