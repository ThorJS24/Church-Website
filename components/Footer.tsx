'use client'

import Link from 'next/link'
import { Church } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getSiteSettings, SiteSettings } from '@/lib/content'
import { Container } from '@/components/ui/container'
import PrivacyDialog from './PrivacyDialog'
import NewsletterSignup from './NewsletterSignup'

const SOCIAL_ICONS: { key: keyof SiteSettings; label: string; path: string }[] = [
  {
    key: 'facebookUrl',
    label: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    key: 'instagramUrl',
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    key: 'youtubeChannelUrl',
    label: 'YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    key: 'whatsappGroupUrl',
    label: 'WhatsApp',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488',
  },
]

const QUICK_LINKS = [
  { href: '/about/beliefs', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/ministries', label: 'Ministries' },
  { href: '/events', label: 'Events' },
]

const RESOURCE_LINKS = [
  { href: '/sermons', label: 'Sermons' },
  { href: '/prayer', label: 'Prayer' },
  { href: '/give', label: 'Give' },
  { href: '/contact', label: 'Contact' },
]

const Footer = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(data => setSettings(data || {}))
      .catch(error => console.error('Footer settings fetch error:', error));
  }, []);

  return (
    <footer className="border-t border-white/10 bg-[#17130F] text-white">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Church className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-title-md">{settings?.churchName || 'Salem Primitive Baptist Church'}</h2>
            </div>
            <p className="mb-5 text-body-sm text-white/60">
              {settings?.tagline || 'A place where faith meets community, and hope comes alive. Join us every Sunday at 9:30 AM.'}
            </p>
            <div className="mb-6 flex gap-2">
              {SOCIAL_ICONS.map(({ key, label, path }) => {
                const url = settings?.[key] as string | undefined;
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                );
              })}
            </div>
            <h3 className="mb-2 text-label uppercase tracking-wide text-white/50">Newsletter</h3>
            <NewsletterSignup />
          </div>

          <div>
            <h3 className="mb-4 text-label uppercase tracking-wide text-white/50">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-label uppercase tracking-wide text-white/50">Resources</h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-label uppercase tracking-wide text-white/50">Contact Info</h3>
            <div className="space-y-2 text-body-sm text-white/60">
              <p className="whitespace-pre-line">
                {settings?.address || '223/838, Near north post office,\nKannangurichi main road, Chinnathirupathi,\nSalem TN, PIN- 636008'}
              </p>
              <p>{settings?.phoneNumber || '+91 94871 62485'}</p>
              <p>{settings?.email || 'contact@salempbc.in'}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-caption text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {settings?.churchName || 'Salem Primitive Baptist Church'}. All rights reserved.</p>
          <div className="flex gap-5">
            <button onClick={() => setShowPrivacyDialog(true)} className="transition-colors hover:text-white">
              Privacy Policy
            </button>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>

      <PrivacyDialog isOpen={showPrivacyDialog} onClose={() => setShowPrivacyDialog(false)} />
    </footer>
  )
}

export default Footer
