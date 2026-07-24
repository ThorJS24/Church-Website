import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery — Salem Primitive Baptist Church',
  description: 'Browse photos from events, worship services, and community gatherings at Salem Primitive Baptist Church.',
  openGraph: {
    title: 'Photo Gallery — Salem Primitive Baptist Church',
    description: 'Browse photos from events and gatherings at Salem Primitive Baptist Church.',
    url: 'https://salempbc.in/gallery',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Gallery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo Gallery — Salem Primitive Baptist Church',
    description: 'Browse photos from events and gatherings at Salem Primitive Baptist Church.',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
