import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Give Online — Salem Primitive Baptist Church',
  description: 'Support the mission of Salem Primitive Baptist Church through online giving. Your generosity funds community outreach, missions, and ministry.',
  openGraph: {
    title: 'Give Online — Salem Primitive Baptist Church',
    description: 'Support the mission of Salem Primitive Baptist Church through online giving.',
    url: 'https://salempbc.in/give',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Give' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Give Online — Salem Primitive Baptist Church',
    description: 'Support the mission of Salem Primitive Baptist Church through online giving.',
  },
};

export default function GiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
