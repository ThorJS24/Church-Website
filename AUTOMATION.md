# 🤖 Automation Scripts

Complete automation for Salem Primitive Baptist Church website setup and deployment.

## 🚀 Quick Commands

```bash
# One-click everything (Windows)
./one-click-setup.bat

# Full automated setup
./auto-setup.bat        # Windows
./auto-setup.sh         # Linux/macOS

# Automated deployment
./auto-deploy.bat       # Windows
```

## 📋 Available Scripts

### 1. **one-click-setup.bat** - Ultimate Simplicity
- Installs dependencies
- Builds project
- Deploys to Vercel
- **Zero user input required**

```bash
# Just double-click or run:
./one-click-setup.bat
```

### 2. **auto-setup.bat/.sh** - Full Setup
- Checks Node.js installation
- Installs all dependencies
- Builds project
- Cleans up cache
- Offers to start dev server

```bash
# Windows
./auto-setup.bat

# Linux/macOS/WSL
chmod +x auto-setup.sh
./auto-setup.sh
```

### 3. **auto-deploy.bat** - Multi-Platform Deploy
- Builds project if needed
- Choice of deployment platforms:
  - Vercel (recommended)
  - Netlify
  - Firebase
  - Static build only

```bash
./auto-deploy.bat
```

## 🎯 Usage Scenarios

### New User (First Time)
```bash
# Clone repo
git clone <repo-url>
cd church-website-nextjs

# One command setup + deploy
./one-click-setup.bat
```

### Development Setup
```bash
# Full setup with dev server
./auto-setup.bat
```

### Production Deployment
```bash
# Choose deployment platform
./auto-deploy.bat
```

## 🔧 Script Features

### Error Handling
- ✅ Checks Node.js installation
- ✅ Validates npm availability
- ✅ Handles build failures
- ✅ Provides clear error messages

### User Experience
- 🎨 Colorized output
- 📊 Progress indicators
- ⚡ Fast execution
- 🔄 Automatic cleanup

### Cross-Platform
- 🪟 Windows (.bat files)
- 🐧 Linux/macOS (.sh files)
- 🔄 WSL compatible

## 📦 NPM Script Integration

All automation scripts are integrated into package.json:

```json
{
  "scripts": {
    "one-click": "./one-click-setup.bat",
    "auto-setup": "./auto-setup.bat",
    "auto-deploy": "./auto-deploy.bat"
  }
}
```

Run with npm:
```bash
npm run one-click      # Ultimate automation
npm run auto-setup     # Full setup
npm run auto-deploy    # Deployment options
```

## 🚨 Prerequisites

### Required
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Git** - For cloning repository

### Optional (Auto-installed)
- **Vercel CLI** - For Vercel deployment
- **Netlify CLI** - For Netlify deployment
- **Firebase CLI** - For Firebase deployment

## 🔍 What Each Script Does

### one-click-setup.bat
1. ✅ Check Node.js
2. 📦 `npm install`
3. 🏗️ Build project
4. 🚀 Deploy to Vercel
5. ✨ Done!

### auto-setup.bat
1. ✅ System checks
2. 📦 Install dependencies
3. 🏗️ Build project
4. 🧹 Clean cache
5. 🖥️ Start dev server (optional)

### auto-deploy.bat
1. 🏗️ Build if needed
2. 🎯 Choose platform
3. 🚀 Deploy
4. ✅ Success message

## 🐛 Troubleshooting

### Script Won't Run
```bash
# Windows: Run as Administrator
# Linux/macOS: Make executable
chmod +x auto-setup.sh
```

### Node.js Not Found
- Install from [nodejs.org](https://nodejs.org)
- Restart terminal
- Run script again

### Build Fails
- Check environment variables in `.env.local`
- Run `npm run clean` first
- Try `npm run fresh-install`

### Deployment Fails
- Ensure you're logged into deployment platform
- Check internet connection
- Verify project builds locally first

## 🎉 Success Indicators

### Setup Complete
```
🎉 SETUP COMPLETE! 🎉
Next steps:
1. Run: npm run dev
2. Open: http://localhost:3000
3. Login with: admin@salemprimitivebaptist.org
```

### Deployment Complete
```
🚀 DEPLOYMENT COMPLETE! 🚀
Your church website is now live! 🙏
```

## 🔄 Continuous Integration

For automated deployments on code changes:

### GitHub Actions (Auto-deploy on push)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support

If automation scripts fail:
1. Check error messages
2. Verify Node.js installation
3. Run manual setup: `npm install && npm run build`
4. Contact: admin@salemprimitivebaptist.org

---

**Automation makes ministry easier! 🤖🙏**