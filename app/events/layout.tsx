import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events — Salem Primitive Baptist Church',
  description: 'Discover upcoming events, services, and gatherings at Salem Primitive Baptist Church in Salem, Tamil Nadu. Stay connected with our community.',
  openGraph: {
    title: 'Events — Salem Primitive Baptist Church',
    description: 'Discover upcoming events and gatherings at Salem Primitive Baptist Church.',
    url: 'https://salempbc.in/events',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events — Salem Primitive Baptist Church',
    description: 'Discover upcoming events and gatherings at Salem Primitive Baptist Church.',
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
