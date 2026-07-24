import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sermons — Salem Primitive Baptist Church',
  description: 'Watch and listen to sermons from Salem Primitive Baptist Church. Explore our library of messages on faith, scripture, and Christian living.',
  openGraph: {
    title: 'Sermons — Salem Primitive Baptist Church',
    description: 'Watch and listen to sermons from Salem Primitive Baptist Church.',
    url: 'https://salempbc.in/sermons',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Sermons' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sermons — Salem Primitive Baptist Church',
    description: 'Watch and listen to sermons from Salem Primitive Baptist Church.',
  },
};

export default function SermonsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
