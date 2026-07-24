# DEPLOYMENT NOTES - Tamil i18n + Accessibility + Mobile-first

## 🚀 Deployment Checklist

### Pre-Deployment Requirements

#### Environment Variables (Required)
```bash
# AWS Polly TTS (Required for voice features)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_DEFAULT_LOCALE=ta
NEXT_PUBLIC_ENABLE_MOBILE_NAV=true
```

#### Vercel Configuration
```json
{
  "env": {
    "AWS_REGION": "us-east-1",
    "AWS_ACCESS_KEY_ID": "@aws-access-key-id",
    "AWS_SECRET_ACCESS_KEY": "@aws-secret-access-key"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_ENABLE_TTS": "true",
      "NEXT_PUBLIC_DEFAULT_LOCALE": "ta"
    }
  }
}
```

### Deployment Steps

#### 1. Pre-deployment Validation
```bash
# Run all checks
npm run lint
npm run type-check
npm run build

# Test TTS API (if AWS credentials available)
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"வணக்கம்","language":"ta"}'
```

#### 2. Database/CMS Preparation
- [ ] Sanity Studio: No schema changes required yet
- [ ] Firebase: Existing configuration compatible
- [ ] Algolia: Existing indexes will work (Tamil indexing is future enhancement)

#### 3. CDN/Asset Preparation
- [ ] Tamil fonts will be loaded from Google Fonts (no CDN changes needed)
- [ ] Existing Cloudinary configuration compatible
- [ ] PWA manifest updated automatically

#### 4. Deployment Command
```bash
# Standard Vercel deployment
vercel --prod

# Or with environment override
NEXT_PUBLIC_DEFAULT_LOCALE=ta vercel --prod
```

### 🔧 Feature Flags

#### TTS (Text-to-Speech)
```javascript
// Disable TTS if AWS not configured
const TTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TTS === 'true' && 
                   process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY;
```

#### Language Detection
```javascript
// Override default language detection
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'ta';
```

#### Mobile Navigation
```javascript
// Disable mobile bottom nav if needed
const MOBILE_NAV_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOBILE_NAV !== 'false';
```

### 📊 Monitoring & Metrics

#### Key Metrics to Watch

##### Performance Metrics
- **LCP (Largest Contentful Paint)**: Target < 2.5s on mobile
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **INP (Interaction to Next Paint)**: Target < 200ms
- **Bundle Size**: Monitor for increases due to Tamil fonts

##### User Experience Metrics
- **Language Distribution**: Track ta/ta_latn/en usage
- **TTS Usage**: Monitor TTS API calls and success rates
- **Mobile Navigation**: Track bottom nav vs top nav usage
- **Accessibility**: Monitor keyboard navigation usage

##### Error Monitoring
- **TTS Errors**: AWS Polly quota/connectivity issues
- **Font Loading**: Tamil font loading failures
- **i18n Errors**: Missing translations or locale issues

#### Monitoring Setup
```javascript
// Sentry configuration for new features
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter TTS-related errors for analysis
    if (event.tags?.feature === 'tts') {
      event.fingerprint = ['tts-error', event.exception?.values?.[0]?.type];
    }
    return event;
  }
});
```

### 🔄 Rollback Plan

#### Immediate Rollback (< 5 minutes)
If critical issues are detected:

```bash
# Revert to previous deployment
vercel rollback

# Or disable new features via environment variables
vercel env add NEXT_PUBLIC_ENABLE_TTS false
vercel env add NEXT_PUBLIC_ENABLE_MOBILE_NAV false
vercel --prod
```

#### Partial Rollback Options

##### Disable TTS Only
```bash
vercel env add NEXT_PUBLIC_ENABLE_TTS false
vercel --prod
```

##### Revert to English Default
```bash
vercel env add NEXT_PUBLIC_DEFAULT_LOCALE en
vercel --prod
```

##### Disable Mobile Navigation
```bash
vercel env add NEXT_PUBLIC_ENABLE_MOBILE_NAV false
vercel --prod
```

#### Full Rollback (Emergency)
```bash
# Checkout previous stable version
git checkout v1.9.0
npm install
vercel --prod

# Update DNS if needed (extreme case)
# Point domain to previous deployment URL
```

### 🚨 Known Issues & Mitigations

#### Potential Issues

##### 1. Tamil Font Loading
**Issue**: Tamil fonts may load slowly on first visit
**Mitigation**: 
- Fonts are preloaded in document head
- Fallback fonts configured
- `font-display: swap` used

**Monitoring**: Watch for layout shift metrics

##### 2. TTS Service Limits
**Issue**: AWS Polly has usage quotas
**Mitigation**:
- Graceful degradation when quota exceeded
- Error messages in user's language
- Caching of common phrases (future enhancement)

**Monitoring**: Track TTS API error rates

##### 3. Mobile Navigation Conflicts
**Issue**: Bottom nav might conflict with browser UI
**Mitigation**:
- Only shows on mobile devices
- Proper z-index management
- Safe area padding for notched devices

**Monitoring**: Track mobile user engagement

##### 4. Language Detection Issues
**Issue**: Incorrect language detection
**Mitigation**:
- Manual language toggle always available
- Cookie-based preference storage
- Fallback to English if detection fails

**Monitoring**: Track language switch events

### 📱 Mobile-Specific Considerations

#### iOS Safari
- Bottom navigation respects safe areas
- Touch targets meet iOS guidelines (44px minimum)
- Proper viewport configuration

#### Android Chrome
- PWA install prompt works correctly
- Bottom navigation doesn't conflict with gesture navigation
- Proper theme color configuration

#### Performance on 3G
- Critical resources prioritized
- Non-essential features load progressively
- Offline fallbacks available

### 🔍 Testing Checklist

#### Pre-deployment Testing
- [ ] All three languages load correctly (ta, ta_latn, en)
- [ ] Language toggle works on all pages
- [ ] TTS buttons appear and function (if AWS configured)
- [ ] Mobile bottom navigation works
- [ ] Skip links function with keyboard navigation
- [ ] All forms validate in Tamil
- [ ] Error pages display correctly
- [ ] PWA install prompt works

#### Post-deployment Testing
- [ ] Production TTS API responds correctly
- [ ] Tamil fonts load without layout shift
- [ ] Mobile navigation works on real devices
- [ ] Language detection works correctly
- [ ] Performance metrics meet targets
- [ ] Accessibility tools report no critical issues

### 📈 Success Criteria

#### Week 1 Targets
- [ ] Zero critical errors in Sentry
- [ ] Mobile Lighthouse score ≥ 85
- [ ] TTS success rate ≥ 95% (if enabled)
- [ ] Language distribution: ≥ 60% Tamil usage

#### Month 1 Targets
- [ ] Mobile Lighthouse score ≥ 90
- [ ] Core Web Vitals all green
- [ ] User engagement increase ≥ 20%
- [ ] Accessibility compliance ≥ 95%

### 🛠️ Troubleshooting Guide

#### Common Issues

##### TTS Not Working
```bash
# Check AWS credentials
curl -X GET https://your-domain.com/api/tts

# Expected response: List of available voices
# Error response: Check AWS configuration
```

##### Tamil Text Not Displaying
1. Check font loading in browser dev tools
2. Verify Tamil font files are accessible
3. Check for CSP (Content Security Policy) issues

##### Mobile Navigation Missing
1. Verify screen size detection
2. Check CSS media queries
3. Ensure JavaScript is enabled

##### Language Toggle Not Working
1. Check cookie storage
2. Verify middleware configuration
3. Test locale routing

### 📞 Support Contacts

#### Technical Issues
- **Primary**: Development Team
- **AWS Issues**: AWS Support (if enterprise account)
- **Vercel Issues**: Vercel Support

#### Content Issues
- **Tamil Translations**: Tamil Language Team
- **Religious Content**: Church Leadership
- **Accessibility**: Accessibility Consultant

### 📋 Post-Deployment Tasks

#### Immediate (Day 1)
- [ ] Monitor error rates and performance
- [ ] Verify all features work in production
- [ ] Check analytics for user behavior changes
- [ ] Test on various mobile devices

#### Week 1
- [ ] Analyze user feedback
- [ ] Review performance metrics
- [ ] Optimize based on real usage data
- [ ] Plan next iteration improvements

#### Month 1
- [ ] Comprehensive performance review
- [ ] User satisfaction survey
- [ ] Plan advanced features (Sanity localization, etc.)
- [ ] Document lessons learned

---

## Emergency Contacts

- **Technical Lead**: [Contact Information]
- **DevOps**: [Contact Information]  
- **Church Administrator**: [Contact Information]
- **AWS Support**: [Account Information]

## Deployment History

| Version | Date | Deployed By | Status | Rollback Time |
|---------|------|-------------|--------|---------------|
| 2.0.0   | TBD  | TBD         | TBD    | TBD           |

---

**Remember**: This is a major release with significant UX changes. Monitor closely for the first 24 hours and be prepared to rollback if critical issues arise.