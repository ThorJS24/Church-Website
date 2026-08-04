const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Content migrated from the church's old Sanity CMS project keeps
      // its imageUrl fields pointing at Sanity's own CDN rather than
      // re-hosting every image — those URLs are permanent per Sanity's
      // asset model, so this is safe to allowlist rather than a temporary
      // workaround.
      { protocol: 'https', hostname: 'cdn.sanity.io' }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  generateBuildId: () => 'build',
  // Admin-managed redirects (app/admin/content -> Redirects tab), resolved
  // here rather than per-request in middleware or app/not-found.tsx.
  // Tried the not-found.tsx route first: reading the request path there
  // needs next/headers' headers(), and that single dynamic call turned out
  // to force the ENTIRE site to render dynamically instead of statically
  // (confirmed by removing it and rebuilding: every route flipped back to
  // static) — a real cost/performance regression for a project that
  // explicitly tightened Firestore reads elsewhere. redirects() here is
  // the documented, build-time-safe way to source this from a database:
  // it doesn't touch per-page rendering at all. Trade-off, stated plainly:
  // a newly added/edited redirect takes effect on the next deploy, not
  // instantly — acceptable for a small site's occasional URL cleanup.
  async redirects() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) return [];

    try {
      const { cert, getApps, initializeApp } = require('firebase-admin/app');
      const { getFirestore } = require('firebase-admin/firestore');
      const app = getApps()[0] || initializeApp({
        credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
      });
      const snap = await getFirestore(app).collection('redirects').get();
      return snap.docs
        .map((d) => d.data())
        .filter((r) => r.fromPath && r.toPath)
        .map((r) => ({
          source: r.fromPath,
          destination: r.toPath,
          permanent: Number(r.statusCode) !== 302,
        }));
    } catch (error) {
      // Never fail the build over this — an unreachable Firestore at build
      // time should just mean "no redirects this deploy," not a broken site.
      console.error('Failed to load redirects for next.config.js:', error);
      return [];
    }
  },
  async headers() {
    const allowedOrigin = process.env.NODE_ENV === 'production'
      ? 'https://salempbc.in'
      : 'http://localhost:3000';

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);