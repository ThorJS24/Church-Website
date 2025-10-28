#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Salem Primitive Baptist Church Website Features...\n');

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('📁 Creating directories...');
const directories = [
  'public/icons',
  'public/sw',
  'app/api/cdn',
  'components/ui'
];

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('\n🎨 Setting up PWA icons...');
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
iconSizes.forEach(size => {
  const iconPath = path.join(process.cwd(), 'public', 'icons', `icon-${size}x${size}.png`);
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, '');
    console.log(`✅ Created icon placeholder: icon-${size}x${size}.png`);
  }
});

console.log('\n⚙️ Setting up Service Worker...');
const swContent = `
const CACHE_NAME = 'salem-pbc-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sw.js'), swContent);
console.log('✅ Service Worker created');

console.log('\n🔧 Updating environment variables...');
const envTemplate = `
# Add these to your .env.local file:

# Email Configuration (Gmail)
CONTACT_EMAIL_USER=your_email@gmail.com
CONTACT_EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@yourchurch.com
PRAYER_TEAM_EMAIL=prayers@yourchurch.com
PASTORAL_TEAM_EMAIL=pastors@yourchurch.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com

# Webhook Secret
WEBHOOK_SECRET=your_webhook_secret_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

fs.writeFileSync(path.join(process.cwd(), '.env.template'), envTemplate);
console.log('✅ Environment template created');

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Copy .env.template to .env.local and fill in your values');
console.log('2. Generate actual PWA icons and replace placeholders');
console.log('3. Test all features locally');
console.log('\n📚 Visit /api/docs for complete API documentation');
console.log('🔍 Search functionality available in navigation');
console.log('🌐 Language switcher available in top navigation');