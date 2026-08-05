import { Fraunces, Figtree, Noto_Sans_Tamil, Noto_Serif_Tamil } from 'next/font/google';
import { MotionConfig } from 'motion/react';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ClientLayout from '@/components/ClientLayout';
import SkipLink from '@/components/SkipLink';
import { ToastProvider } from '@/components/ui-legacy/Toast';
import { PublicChrome } from '@/components/PublicChrome';
import { ThemeAccentInjector } from '@/components/ThemeAccentInjector';
import { cn } from '@/lib/utils';

// Warm & traditional-modern pairing: Fraunces (serif, display/headings —
// used deliberately in italic for Scripture references / pull-quotes) +
// Figtree (sans, body/UI — reads warmer than Inter, which the first
// rebuild used and is part of why it read "corporate"). Static weights
// only (not the full variable axis range) to control font payload.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

// Real next/font/google loaders for what were previously dead
// fontFamily.tamil/tamil-serif config entries (the CSS vars they
// referenced were never defined anywhere) — matches the weights the old
// manual @font-face/CSS @import used (400/500/600).
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans-tamil',
  display: 'swap',
});

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-serif-tamil',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://salempbc.in'),
  title: 'Salem Primitive Baptist Church',
  description: 'Salem Primitive Baptist Church — A place where faith, hope, and love come together. Join us every Sunday at 9:30 AM in Salem, Tamil Nadu.',
  keywords: ['church', 'Salem', 'Baptist', 'Tamil Nadu', 'worship', 'faith', 'community', 'sermons', 'events'],
  authors: [{ name: 'Salem Primitive Baptist Church' }],
  creator: 'Salem Primitive Baptist Church',
  publisher: 'Salem Primitive Baptist Church',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://salempbc.in',
    siteName: 'Salem Primitive Baptist Church',
    title: 'Salem Primitive Baptist Church',
    description: 'A place where faith, hope, and love come together. Join us every Sunday at 9:30 AM.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Salem Primitive Baptist Church',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salem Primitive Baptist Church',
    description: 'A place where faith, hope, and love come together. Join us every Sunday at 9:30 AM.',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: 'Salem Primitive Baptist Church',
    url: 'https://salempbc.in',
    description: 'A place where faith, hope, and love come together. Join us every Sunday at 9:30 AM.',
    address: { '@type': 'PostalAddress', addressLocality: 'Salem', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
  };

  return (
    <html
      lang="en"
      className={cn(fraunces.variable, figtree.variable, notoSansTamil.variable, notoSerifTamil.variable)}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <ToastProvider>
                  <ThemeAccentInjector />
                  <ClientLayout>
                    <SkipLink />
                    <PublicChrome>{children}</PublicChrome>
                  </ClientLayout>
                </ToastProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
