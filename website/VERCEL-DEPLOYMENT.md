# Vercel Deployment Guide for SenScript Marketing Site

## 🚀 Deployment Steps

### 1. Deploy via Vercel CLI

Run in the `/website` directory:
```bash
vercel
```

When prompted:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project?: No (create new)
- Project name: `senscript-marketing`
- Directory: `./` (current directory)
- Build settings: Accept defaults (auto-detected Next.js)

### 2. Set Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these variables (get from your .env files):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://getscript.sen.studio
SCRIPT_APP_URL=https://script.sen.studio
```

### 3. Add Custom Domain

In Vercel Dashboard → Your Project → Settings → Domains:
1. Add domain: `getscript.sen.studio`
2. You'll get DNS records to add

### 4. Configure DNS (in sen.studio DNS settings)

Add CNAME record:
```
Type: CNAME
Name: getscript
Value: cname.vercel-dns.com.
TTL: Auto/3600
```

Or if using A records:
```
Type: A
Name: getscript
Value: 76.76.21.21
```

### 5. Deploy to Production

After environment variables are set:
```bash
vercel --prod
```

## 🔧 Configuration Files

### vercel.json
Already configured with:
- Build settings
- Environment variable mappings
- Function configurations
- Frankfurt region (fra1) for EU hosting

### Required Environment Variables
- **Clerk**: Authentication keys
- **Stripe**: Payment processing keys
- **URLs**: App and API endpoints

## 🌐 Domain Setup

### Primary Domain
`https://getscript.sen.studio` - Marketing site

### Related Domains
- `https://script.sen.studio` - Web application
- `https://api.sen.studio` - API endpoints (future)

## 📝 Post-Deployment Checklist

- [ ] Verify Clerk authentication works
- [ ] Test Sign Up/Sign In flow
- [ ] Check dashboard access
- [ ] Test theme switching
- [ ] Verify all pages load
- [ ] Check mobile responsiveness
- [ ] Test Stripe webhook endpoint
- [ ] Verify environment variables
- [ ] Check custom domain SSL certificate
- [ ] Test redirect to script.sen.studio

## 🔄 Continuous Deployment

### Auto-deploy from GitHub
1. Connect GitHub repo in Vercel Dashboard
2. Set production branch to `main` or `payment-integration`
3. Enable automatic deployments

### Manual Deploy
```bash
vercel --prod
```

### Preview Deployments
Every push to a branch creates a preview:
```bash
vercel
```

## 🐛 Troubleshooting

### If custom domain doesn't work:
1. Check DNS propagation (can take up to 48h)
2. Verify CNAME/A records in DNS provider
3. Check SSL certificate in Vercel dashboard

### If authentication fails:
1. Verify Clerk keys in Vercel environment
2. Check CORS settings in Clerk dashboard
3. Add production domain to Clerk allowed origins

### If payments don't work:
1. Add webhook endpoint to Stripe dashboard
2. Update webhook secret in Vercel
3. Verify Stripe keys are for correct environment

## 🔗 Important URLs

- **Production**: https://getscript.sen.studio
- **Vercel Dashboard**: https://vercel.com/[your-account]/senscript-marketing
- **Preview URLs**: Generated per deployment
- **Analytics**: Available in Vercel dashboard

## 📊 Monitoring

Vercel provides:
- Real-time analytics
- Error tracking
- Performance metrics
- Function logs
- Build logs

## 🚨 Webhook Configuration

After deployment, add this webhook URL to Stripe:
```
https://getscript.sen.studio/api/stripe/webhook
```

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`