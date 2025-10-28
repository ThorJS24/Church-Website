'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import { fetchSanityData } from '@/lib/sanity-optimized'

interface Announcement {
  title: string;
  content: any;
  date?: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await fetchSanityData(`*[_type == "announcement"] | order(_createdAt desc)[0...3]`)
        setAnnouncements(data || [])
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!announcements.length) {
    return null
  }

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
                  <p className="text-gray-600 mb-2">
                    {typeof announcement.content === 'string' 
                      ? announcement.content 
                      : Array.isArray(announcement.content) 
                        ? announcement.content.map((block: any) => 
                            block.children?.map((child: any) => child.text).join(' ') || ''
                          ).join(' ') 
                        : 'Announcement content available'}
                  </p>
                  <small className="text-gray-500">
                    {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'Recent'}
                  </small>
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