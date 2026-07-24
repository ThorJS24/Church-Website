# ⚡ Quick Start Guide

Get your Salem Primitive Baptist Church website running in 5 minutes!

## 🚀 Super Quick Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd church-website-nextjs
npm install

# 2. Run interactive setup
npm run setup

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📋 Minimum Required Setup

You only need these 4 services to get started:

### 1. Firebase (Free - Auth & Content Database)
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a project → enable Authentication and Firestore
- Copy the web app config, and deploy `firestore.rules` / `firestore.indexes.json`

### 2. Bible API (Free - Daily Verses)
- Go to [bible-api.com](https://bible-api.com)
- Sign up → Get API key

### 3. Admin Account
- Choose secure email and password
- This will be your login to manage the site

### 4. Security Keys
- JWT Secret: Any random 32+ character string
- Encryption Key: Any random 32 character string

## 🎯 Essential Environment Variables

Create `.env.local` with these minimum variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_service_account_private_key

# Bible API
BIBLE_API_KEY=your_bible_api_key
NEXT_PUBLIC_BIBLE_API_KEY=your_bible_api_key

# Security
JWT_SECRET_KEY=your_32_plus_character_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key

# Admin Account
ADMIN_EMAIL=admin@yourchurch.org
ADMIN_NAME=Church Administrator
ADMIN_PASSWORD=SecurePassword123!
```

## 🏃‍♂️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # Interactive setup wizard
npm run clean        # Clear cache
npm run lint         # Check code quality
```

## 🌐 Deploy in 1 Minute

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
- Connect GitHub repo to Netlify
- Build command: `npm run build`
- Publish directory: `out`

## 🔧 Troubleshooting

**Site won't start?**
- Check all required environment variables are set
- Run `npm run clean` then `npm run dev`

**Build fails?**
- Run `npm run type-check` to find TypeScript errors
- Clear cache with `npm run clean`

## 📚 Next Steps

1. **Customize Content**
   - Go to `/admin/content` (requires an `admin` or `super_admin` role)
   - Add your church information, events, sermons

2. **Add Optional Services**
   - Email notifications (Gmail SMTP)
   - Analytics (Google Analytics)
   - Image optimization (Cloudinary)

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for detailed instructions

## 🆘 Need Help?

- 📖 Full documentation: `README.md`
- 🚀 Deployment guide: `DEPLOYMENT.md`
- 📧 Support: admin@salemprimitivebaptist.org

---

**Your church website will be live in minutes! 🙏**