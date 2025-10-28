# Salem Primitive Baptist Church Website

A modern, full-featured church website built with Next.js 14, featuring dynamic content management, authentication, and interactive Bible verses.

## 🌟 Features

### Core Features
- **Dynamic Content Management** - Powered by Sanity CMS
- **Interactive Bible Verses** - Daily verses with NKJV Bible API integration
- **User Authentication** - JWT-based login/register system
- **Privacy Compliance** - GDPR-compliant privacy dialog
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Progressive Web App** - Offline support and installable
- **Real-time Updates** - Live content updates from Sanity

### Advanced Features
- **Live Streaming** - YouTube integration for services
- **Event Management** - Interactive calendar with Google Calendar sync
- **Prayer Requests** - Community prayer submission system
- **Gallery** - Photo gallery with Cloudinary optimization
- **Contact Forms** - Multiple contact forms with email notifications
- **Search** - Algolia-powered site search
- **Analytics** - Google Analytics integration
- **Monitoring** - Sentry error tracking
- **Notifications** - Push notifications via Firebase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd church-website-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📋 Environment Variables

### Required Variables

#### Sanity CMS (Content Management)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
SANITY_STUDIO_TOKEN=your_studio_token
```

#### Authentication & Security
```env
JWT_SECRET_KEY=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
WEBHOOK_SECRET=your_webhook_secret
```

#### Bible API
```env
BIBLE_API_KEY=your_bible_api_key
NEXT_PUBLIC_BIBLE_API_KEY=your_bible_api_key
```

#### Admin Credentials
```env
ADMIN_EMAIL=admin@yourchurch.org
ADMIN_NAME=Church Administrator
ADMIN_PASSWORD=SecurePassword123!
```

### Optional Services

#### Firebase (Authentication & Hosting)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Email (Gmail SMTP - Free)
```env
CONTACT_EMAIL_USER=your_gmail@gmail.com
CONTACT_EMAIL_PASS=your_app_password
SECURITY_EMAIL_USER=your_gmail@gmail.com
SECURITY_EMAIL_PASS=your_app_password
```

#### SMS (Twilio - Free Trial)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

#### Analytics & Monitoring
```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### CDN & Image Optimization
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Search (Algolia - Free Tier)
```env
ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_API_KEY=your_admin_key
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_key
```

#### Maps
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## 🛠️ Setup Instructions

### 1. Sanity CMS Setup

1. **Create Sanity Project**
   ```bash
   cd studio
   npm install
   npx sanity init
   ```

2. **Deploy Sanity Studio**
   ```bash
   npx sanity deploy
   ```

3. **Get API Tokens**
   - Go to sanity.io/manage
   - Select your project
   - Go to API → Tokens
   - Create tokens for both read and write access

### 2. Bible API Setup

1. **Get Free API Key**
   - Visit [Bible API](https://bible-api.com/)
   - Sign up for free account
   - Get your API key

### 3. Firebase Setup (Optional)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication, Firestore, Storage

2. **Get Configuration**
   - Project Settings → General → Your apps
   - Copy configuration values

### 4. Email Setup (Gmail)

1. **Enable 2FA on Gmail**
2. **Generate App Password**
   - Google Account → Security → App passwords
   - Generate password for "Mail"

### 5. Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Manual Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
church-website-nextjs/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
├── models/                # Data models
├── public/                # Static assets
├── studio/                # Sanity CMS studio
├── types/                 # TypeScript types
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Analysis
npm run build:analyze   # Build with bundle analyzer
npm run type-check      # TypeScript type checking

# Deployment
npm run deploy          # Deploy to Vercel
npm run optimize        # Build and export static files
```

## 🎨 Customization

### Styling
- **Framework**: Tailwind CSS
- **Components**: Custom components in `/components`
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Content Management
- **CMS**: Sanity Studio at `/studio`
- **Schemas**: Defined in `/studio/schemaTypes`
- **Content**: Managed through Sanity Studio interface

### Authentication
- **System**: JWT-based authentication
- **Context**: `AuthContext` in `/contexts`
- **API**: Authentication routes in `/app/api/auth`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Server-side validation
- **CORS Protection** - API route protection
- **Environment Variables** - Sensitive data protection
- **GDPR Compliance** - Privacy dialog and data handling
- **Content Security Policy** - XSS protection

## 📱 Progressive Web App

- **Offline Support** - Service worker implementation
- **Installable** - Add to home screen
- **Push Notifications** - Firebase messaging
- **Responsive** - Mobile-first design

## 🔍 SEO & Performance

- **Next.js 14** - Latest performance optimizations
- **Image Optimization** - Next.js Image component
- **Static Generation** - Pre-rendered pages
- **Sitemap** - Auto-generated sitemap
- **Meta Tags** - Dynamic meta tags
- **Analytics** - Google Analytics integration

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors with Sanity**
   - Use API proxy routes in `/app/api/sanity-proxy`
   - Client-side requests must go through proxy

2. **Environment Variables Not Loading**
   - Ensure `.env.local` exists
   - Restart development server
   - Check variable names (NEXT_PUBLIC_ prefix for client-side)

3. **Build Errors**
   - Run `npm run type-check` to find TypeScript errors
   - Check all environment variables are set
   - Clear `.next` cache: `rm -rf .next`

4. **Authentication Issues**
   - Verify JWT_SECRET_KEY is set
   - Check admin credentials in environment
   - Clear browser localStorage

### Performance Issues
- Enable image optimization in `next.config.js`
- Use Cloudinary for image CDN
- Enable caching in API routes

## 📞 Support

For technical support or questions:
- **Email**: admin@salemprimitivebaptist.org
- **Documentation**: Check inline code comments
- **Issues**: Create GitHub issue for bugs

## 📄 License

This project is private and proprietary to Salem Primitive Baptist Church.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Sanity** - Excellent headless CMS
- **Vercel** - Seamless deployment platform
- **Tailwind CSS** - Utility-first CSS framework
- **Bible API** - Free Bible verse access

---

**Built with ❤️ for Salem Primitive Baptist Church**