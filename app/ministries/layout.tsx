import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ministries — Salem Primitive Baptist Church',
  description: 'Explore the ministries of Salem Primitive Baptist Church — children, youth, adults, and more. Find your place to serve and grow in faith.',
  openGraph: {
    title: 'Ministries — Salem Primitive Baptist Church',
    description: 'Explore the ministries of Salem Primitive Baptist Church and find your place to serve.',
    url: 'https://salempbc.in/ministries',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Ministries' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ministries — Salem Primitive Baptist Church',
    description: 'Explore the ministries of Salem Primitive Baptist Church.',
  },
};

export default function MinistriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
