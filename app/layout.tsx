import { Archivo, Public_Sans, Source_Serif_4, IBM_Plex_Mono, Noto_Sans_Tamil, Noto_Serif_Tamil } from 'next/font/google';
import { MotionConfig } from 'motion/react';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ClientLayout from '@/components/ClientLayout';
import SkipLink from '@/components/SkipLink';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PublicChrome } from '@/components/PublicChrome';
import { ThemeAccentInjector } from '@/components/ThemeAccentInjector';
import { cn } from '@/lib/utils';

// Swiss-grid backbone + documentary warmth: four deliberate roles, not the
// generic "serif heading + italic quote + sans metadata" default.
// - Archivo: display/headings ONLY (grotesque, confident, technical).
// - Public Sans: body copy and UI chrome (civic/humanist register — a
//   deliberate nod to the modern-civic research lineage, distinct from the
//   Inter/Figtree either prior rebuild used).
// - Source Serif 4: the READING face — scripture references, testimonials,
//   pull-quotes ONLY. Never a heading. This is what keeps serif+italic from
//   collapsing back into the rejected default: it's scoped to specific
//   editorial moments, not applied everywhere.
// - IBM Plex Mono: eyebrows, metadata, labels, tabular/admin data.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-plex-mono',
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
  // Was never referenced anywhere in the app before, so the browser had no
  // way to discover /manifest.json — PWA install prompts couldn't have
  // worked regardless of the icon files it points to.
  manifest: '/manifest.json',
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
  robots: {
    index: true,
    follow: true,
  },
};

// Next.js 15 split viewport out of `metadata` into its own export — the old
// nested `metadata.viewport` field is silently ignored and logs a dev
// warning ("Unsupported metadata viewport is configured in metadata
// export"), which showed up on every request.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#233A5C',
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
      className={cn(archivo.variable, publicSans.variable, sourceSerif.variable, plexMono.variable, notoSansTamil.variable, notoSerifTamil.variable)}
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
            <AccessibilityProvider>
              <LanguageProvider>
                <AuthProvider>
                  <TooltipProvider>
                    <ThemeAccentInjector />
                    <ClientLayout>
                      <SkipLink />
                      <PublicChrome>{children}</PublicChrome>
                    </ClientLayout>
                    <Toaster />
                  </TooltipProvider>
                </AuthProvider>
              </LanguageProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
