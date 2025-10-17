'use client'

import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'

const Announcements = () => {
  const announcements = [
    {
      title: 'Welcome New Members',
      content: 'We are excited to welcome our new members who joined us this month.',
      date: '2024-01-01'
    },
    {
      title: 'Volunteer Opportunity',
      content: 'We need volunteers for our upcoming community outreach event.',
      date: '2024-01-01'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="card p-8"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Latest Announcements</h2>
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Megaphone className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{announcement.title}</h4>
                  <p className="text-gray-600 mb-2">{announcement.content}</p>
                  <small className="text-gray-500">{new Date(announcement.date).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Announcements