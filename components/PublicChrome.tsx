'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import DivineAudio from '@/components/DivineAudio';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import GDPRCompliance from '@/components/GDPRCompliance';

/**
 * The admin panel is its own immersive dashboard shell (AdminLayout) — the
 * public marketing nav/footer/bottom-nav, ambient audio, PWA prompt, and
 * cookie notice don't belong there, same as any Linear/Supabase-style
 * admin surface.
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="grow pt-16 pb-16 sm:pt-[6.75rem] md:pb-0" role="main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileBottomNav />
      <DivineAudio autoPlay={false} showControls={true} />
      <PWAInstallPrompt />
      <GDPRCompliance />
    </div>
  );
}
