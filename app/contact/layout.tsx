import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Salem Primitive Baptist Church',
  description: 'Get in touch with Salem Primitive Baptist Church. Find our address, phone number, and send us a message. We\'d love to hear from you.',
  openGraph: {
    title: 'Contact Us — Salem Primitive Baptist Church',
    description: 'Get in touch with Salem Primitive Baptist Church. We\'d love to hear from you.',
    url: 'https://salempbc.in/contact',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Salem PBC Contact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Salem Primitive Baptist Church',
    description: 'Get in touch with Salem Primitive Baptist Church.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
