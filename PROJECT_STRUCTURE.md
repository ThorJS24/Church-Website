# 📁 Project Structure

Complete overview of the Salem Primitive Baptist Church website codebase.

## 🏗️ Root Directory

```
church-website-nextjs/
├── 📁 app/                    # Next.js 14 App Router
├── 📁 components/             # Reusable React components
├── 📁 contexts/               # React Context providers
├── 📁 lib/                    # Utility libraries & configurations
├── 📁 models/                 # TypeScript data models
├── 📁 public/                 # Static assets
├── 📁 studio/                 # Sanity CMS studio
├── 📁 types/                  # TypeScript type definitions
├── 📄 README.md               # Main documentation
├── 📄 QUICKSTART.md           # Quick setup guide
├── 📄 DEPLOYMENT.md           # Deployment instructions
├── 📄 setup.js                # Interactive setup script
└── 📄 package.json            # Dependencies & scripts
```

## 📱 App Directory (Next.js 14 App Router)

```
app/
├── 📁 api/                    # API routes (serverless functions)
│   ├── 📁 auth/              # Authentication endpoints
│   ├── 📁 bible/             # Bible verse API proxy
│   ├── 📁 contact/           # Contact form handlers
│   ├── 📁 sanity-proxy/      # Sanity CMS proxy (CORS fix)
│   └── 📁 [other-apis]/      # Various API endpoints
├── 📁 (pages)/               # Website pages
│   ├── 📁 about/             # About church pages
│   ├── 📁 events/            # Events & calendar
│   ├── 📁 sermons/           # Sermon archive
│   ├── 📁 contact/           # Contact forms
│   ├── 📁 dashboard/         # User dashboard
│   ├── 📁 login/             # Authentication pages
│   └── 📁 [other-pages]/     # Additional pages
├── 📄 layout.tsx             # Root layout component
├── 📄 page.tsx               # Homepage
├── 📄 globals.css            # Global styles
├── 📄 loading.tsx            # Loading UI
├── 📄 error.tsx              # Error handling
└── 📄 not-found.tsx          # 404 page
```

## 🧩 Components Directory

```
components/
├── 📄 BibleVerse.tsx         # Interactive daily Bible verse
├── 📄 PrivacyDialog.tsx      # GDPR compliance modal
├── 📄 Navbar.tsx             # Navigation component
├── 📄 Footer.tsx             # Footer component
├── 📄 Hero.tsx               # Homepage hero section
├── 📄 ContactForm.tsx        # Contact form component
├── 📄 LiveStream.tsx         # YouTube live stream
├── 📄 InteractiveCalendar.tsx # Event calendar
├── 📄 LoadingSpinner.tsx     # Loading animations
├── 📄 NotificationSystem.tsx # Push notifications
├── 📄 SearchModal.tsx        # Site search
├── 📄 UserManagement.tsx     # User account management
└── 📄 [other-components]/    # Additional UI components
```

### Component Categories

**🎨 UI Components**
- `AnimatedButton.tsx` - Interactive buttons
- `AnimatedCard.tsx` - Card animations
- `LoadingSpinner.tsx` - Loading states
- `OptimizedImage.tsx` - Image optimization

**⛪ Church-Specific**
- `BibleVerse.tsx` - Daily Bible verses
- `LiveStream.tsx` - Service streaming
- `PrayerEffects.tsx` - Prayer page effects
- `SacredText.tsx` - Scripture display

**📱 Interactive**
- `InteractiveCalendar.tsx` - Event calendar
- `SearchModal.tsx` - Site search
- `ContactForm.tsx` - Contact forms
- `NotificationSystem.tsx` - Alerts

## 🔧 Contexts Directory

```
contexts/
├── 📄 AuthContext.tsx        # User authentication state
├── 📄 ThemeContext.tsx       # Dark/light theme
├── 📄 LanguageContext.tsx    # Multi-language support
└── 📄 LoadingContext.tsx     # Global loading state
```

## 📚 Lib Directory

```
lib/
├── 📄 sanity-optimized.ts    # Sanity CMS client (CORS-safe)
├── 📄 bible-api.ts           # Bible verse API integration
├── 📄 auth.ts                # Authentication utilities
├── 📄 firebase.ts            # Firebase configuration
├── 📄 encryption.ts          # Data encryption
├── 📄 validation.ts          # Input validation
├── 📄 utils.ts               # General utilities
├── 📄 analytics.ts           # Google Analytics
├── 📄 cloudinary.ts          # Image optimization
├── 📄 algolia.ts             # Search functionality
└── 📄 security.ts            # Security utilities
```

### Library Categories

**🔌 External Services**
- `sanity-optimized.ts` - Content management
- `bible-api.ts` - Bible verses
- `firebase.ts` - Authentication & hosting
- `cloudinary.ts` - Image CDN
- `algolia.ts` - Search engine

**🔒 Security & Auth**
- `auth.ts` - JWT authentication
- `encryption.ts` - Data encryption
- `security.ts` - Security utilities
- `validation.ts` - Input sanitization

**📊 Analytics & Performance**
- `analytics.ts` - Usage tracking
- `performance.ts` - Performance monitoring
- `offline.ts` - PWA functionality

## 🗂️ Models Directory

```
models/
├── 📄 User.ts                # User data model
├── 📄 Event.ts               # Church event model
├── 📄 Sermon.ts              # Sermon data model
├── 📄 PrayerRequest.ts       # Prayer request model
├── 📄 Series.ts              # Sermon series model
└── 📄 Speaker.ts             # Speaker/pastor model
```

## 🎨 Public Directory

```
public/
├── 📁 images/                # Static images
│   ├── 📄 hero-bg.jpg       # Homepage background
│   ├── 📄 default-sermon.jpg # Sermon placeholder
│   └── 📄 [other-images]/   # Church photos
├── 📁 icons/                 # App icons & favicons
├── 📁 audio/                 # Audio files
├── 📁 videos/                # Video files
├── 📁 gallery/               # Photo gallery
├── 📄 manifest.json          # PWA manifest
├── 📄 sw.js                  # Service worker
└── 📄 robots.txt             # SEO robots file
```

## 🎛️ Studio Directory (Sanity CMS)

```
studio/
├── 📁 schemaTypes/           # Content schemas
│   ├── 📄 sermon.ts         # Sermon content type
│   ├── 📄 event.ts          # Event content type
│   ├── 📄 pastor.ts         # Pastor profile type
│   ├── 📄 announcement.ts   # Announcement type
│   └── 📄 [other-schemas]/  # Additional content types
├── 📄 sanity.config.ts       # Studio configuration
├── 📄 package.json           # Studio dependencies
└── 📄 README.md              # Studio documentation
```

## 📝 Types Directory

```
types/
├── 📄 index.ts               # Main type exports
├── 📄 contact.ts             # Contact form types
└── 📄 youtube.d.ts           # YouTube API types
```

## ⚙️ Configuration Files

```
Root Files:
├── 📄 next.config.js         # Next.js configuration
├── 📄 tailwind.config.js     # Tailwind CSS config
├── 📄 tsconfig.json          # TypeScript config
├── 📄 .eslintrc.json         # ESLint rules
├── 📄 postcss.config.js      # PostCSS config
├── 📄 middleware.ts          # Next.js middleware
├── 📄 .env.example           # Environment template
├── 📄 .env.local             # Local environment (gitignored)
├── 📄 .gitignore             # Git ignore rules
├── 📄 vercel.json            # Vercel deployment config
└── 📄 firebase.json          # Firebase hosting config
```

## 🔄 Data Flow

```
User Request → Next.js App Router → API Routes → External Services
                     ↓
              React Components → Contexts → UI Updates
                     ↓
              Sanity CMS ← → Database/Storage
```

## 🎯 Key Features by Directory

### `/app/api/` - Backend Logic
- Authentication (JWT)
- Contact form processing
- Bible verse fetching
- Sanity CMS proxy (CORS fix)
- Email notifications

### `/components/` - UI Layer
- Reusable components
- Church-specific widgets
- Interactive elements
- Responsive design

### `/lib/` - Business Logic
- External API integrations
- Security utilities
- Data processing
- Configuration management

### `/studio/` - Content Management
- Sanity CMS schemas
- Content editing interface
- Media management
- Content validation

## 🚀 Development Workflow

1. **Content** → Edit in Sanity Studio
2. **Styling** → Modify Tailwind classes
3. **Logic** → Update components/lib files
4. **API** → Add routes in app/api/
5. **Deploy** → Push to Git → Auto-deploy

## 📊 File Size Guidelines

- **Components**: < 200 lines
- **API Routes**: < 100 lines
- **Utilities**: < 150 lines
- **Pages**: < 300 lines

## 🔍 Finding Files Quickly

**Need to modify...**
- **Homepage content** → `app/page.tsx`
- **Navigation** → `components/Navbar.tsx`
- **Bible verses** → `components/BibleVerse.tsx`
- **Authentication** → `contexts/AuthContext.tsx`
- **API endpoints** → `app/api/[endpoint]/route.ts`
- **Styles** → `app/globals.css` or component files
- **Content schemas** → `studio/schemaTypes/`

---

**This structure supports scalability, maintainability, and team collaboration! 🏗️**