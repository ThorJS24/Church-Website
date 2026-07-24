import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ClientLayout from '@/components/ClientLayout';
import DivineAudio from '@/components/DivineAudio';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import GDPRCompliance from '@/components/GDPRCompliance';
import SkipLink from '@/components/SkipLink';
import MobileBottomNav from '@/components/MobileBottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ClientLayout>
                <SkipLink />
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main 
                    id="main-content"
                    className="flex-grow pt-16 pb-16 md:pb-0"
                    role="main"
                  >
                    {children}
                  </main>
                  <Footer />
                </div>
                <MobileBottomNav />
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