'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter, Church } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Church className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{process.env.NEXT_PUBLIC_CHURCH_NAME || 'Salem Primitive Baptist Church'}</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              A place where faith meets community, and hope comes alive.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 dark:text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/ministries" className="text-gray-400 hover:text-white transition-colors">Ministries</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/sermons" className="text-gray-400 hover:text-white transition-colors">Sermons</Link></li>
              <li><Link href="/prayer" className="text-gray-400 hover:text-white transition-colors">Prayer</Link></li>
              <li><Link href="/give" className="text-gray-400 hover:text-white transition-colors">Give</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Info</h4>
            <div className="space-y-1 text-gray-400 text-sm">
              <p>223/838, Near north post office,</p>
              <p>Kannangurichi main road,</p>
              <p>Chinnathirupathi, Salem TN,</p>
              <p>PIN- 636008</p>
              <p className="pt-2">{process.env.NEXT_PUBLIC_CHURCH_PHONE || '+91 94871 62485'}</p>
              <p>{process.env.NEXT_PUBLIC_CHURCH_EMAIL || 'elicohen.mossad.il@gmail.com'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {process.env.NEXT_PUBLIC_CHURCH_NAME || 'Salem Primitive Baptist Church'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer