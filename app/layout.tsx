import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientLayout from '@/components/ClientLayout';
import DivineAudio from '@/components/DivineAudio';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import GDPRCompliance from '@/components/GDPRCompliance';


const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Salem Primitive Baptist Church - Welcome Home',
  description: 'Join Salem Primitive Baptist Church - A place where faith, hope, and love come together.',
  keywords: 'church, community, faith, worship, Salem Primitive Baptist Church, Christian',
  authors: [{ name: 'Salem Primitive Baptist Church' }],
  creator: 'Salem Primitive Baptist Church',
  publisher: 'Salem Primitive Baptist Church',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://salemprimitivebaptist.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Salem Primitive Baptist Church - Welcome Home',
    description: 'Join Salem Primitive Baptist Church - A place where faith, hope, and love come together.',
    url: 'https://salemprimitivebaptist.org',
    siteName: 'Salem Primitive Baptist Church',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Salem Primitive Baptist Church',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salem Primitive Baptist Church - Welcome Home',
    description: 'Join Salem Primitive Baptist Church - A place where faith, hope, and love come together.',
    images: ['/twitter-image.jpg'],
    creator: '@salemprimitivebaptist',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`} />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
          `
        }} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme') || 'light';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            })()
          `
        }} />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors min-h-screen`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ClientLayout>
              <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
              <DivineAudio autoPlay={false} showControls={true} />
              <PWAInstallPrompt />
              <GDPRCompliance />
              </ClientLayout>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}