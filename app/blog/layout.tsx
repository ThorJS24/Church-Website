import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Salem Primitive Baptist Church',
  description: 'Reflections, updates, and stories from Salem Primitive Baptist Church.',
  openGraph: {
    title: 'Blog — Salem Primitive Baptist Church',
    description: 'Reflections, updates, and stories from Salem Primitive Baptist Church.',
    url: 'https://salempbc.in/blog',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Salem Primitive Baptist Church',
    description: 'Reflections, updates, and stories from Salem Primitive Baptist Church.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
