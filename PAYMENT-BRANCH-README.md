# Payment Integration Branch

## 🎯 Branch Purpose
Implement complete payment and subscription system across SenScript ecosystem

## ✅ Current Status

### Completed (from chrome-web-app branch)
- ✅ Clerk authentication on marketing site
- ✅ User dashboard with mock usage data
- ✅ Stripe API routes structure
- ✅ Database schema for subscriptions
- ✅ Environment configuration

### 🔄 In Progress
- [ ] Web app (script.sen.studio) Clerk integration
- [ ] Real-time usage tracking
- [ ] Stripe product creation

## 📋 Implementation Checklist

### Phase 1: Web App Authentication
- [ ] Install Clerk in script.sen.studio
- [ ] Add ClerkProvider wrapper
- [ ] Create auth check on app load
- [ ] Block transcription for non-authenticated users
- [ ] Add user info display in UI

### Phase 2: Usage Tracking System
- [ ] Create usage tracking API endpoint
- [ ] Implement real-time minute deduction
- [ ] Add usage alerts (10, 5, 1 minute warnings)
- [ ] Create usage history tracking
- [ ] Add session management

### Phase 3: Stripe Products Setup
- [ ] Create products in Stripe Dashboard:
  - [ ] 15-minute boost (€1)
  - [ ] Essential plan (€9/month - 600 min)
  - [ ] Professional plan (€29/month - 2500 min)
  - [ ] Enterprise plan (Custom)
- [ ] Get product/price IDs
- [ ] Update environment variables

### Phase 4: Checkout Implementation
- [ ] Create checkout page on marketing site
- [ ] Implement subscription checkout flow
- [ ] Add boost purchase button
- [ ] Handle success/cancel redirects
- [ ] Test checkout in test mode

### Phase 5: Webhook Processing
- [ ] Set up Stripe webhook endpoint
- [ ] Handle checkout.session.completed
- [ ] Handle customer.subscription.updated
- [ ] Handle customer.subscription.deleted
- [ ] Update user subscription in database

### Phase 6: User Experience
- [ ] Add subscription management in dashboard
- [ ] Create billing portal redirect
- [ ] Add usage graphs/charts
- [ ] Implement quick boost purchase
- [ ] Add payment method management

### Phase 7: Testing
- [ ] Test free trial flow
- [ ] Test subscription purchase
- [ ] Test boost purchase
- [ ] Test usage tracking
- [ ] Test cross-domain auth
- [ ] Test webhook processing

## 🚀 Quick Start

### 1. Set up Stripe Products
```bash
# Go to Stripe Dashboard
# Create products and get price IDs
# Update .env with real price IDs
```

### 2. Install Dependencies (Web App)
```bash
cd script-sen-studio
npm install @clerk/nextjs stripe @stripe/stripe-js
```

### 3. Run Both Apps
```bash
# Terminal 1 - Marketing Site
cd website
npm run dev

# Terminal 2 - Web App
cd script-sen-studio
npm run dev
```

## 🔑 Environment Variables Needed

```env
# Both Apps Need
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Marketing Site
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (after creating products)
STRIPE_PRICE_BOOST=price_...
STRIPE_PRICE_ESSENTIAL=price_...
STRIPE_PRICE_PROFESSIONAL=price_...

# Database
DATABASE_URL=postgresql://...
```

## 📊 Database Requirements

The following tables need to be created/updated:
- `users` - Store Clerk user data
- `subscriptions` - Track active subscriptions
- `usage_sessions` - Track usage per session
- `boost_purchases` - Track boost purchases
- `cheat_cards` - Store generated cards

## 🧪 Testing Scenarios

1. **New User Flow**
   - Sign up → Get 90 free minutes → Use app → Track usage

2. **Subscription Purchase**
   - Low minutes → Click upgrade → Stripe checkout → Webhook updates → Continue using

3. **Boost Purchase**
   - Running low → Quick €1 boost → Instant 15 minutes → No interruption

4. **Cross-Domain Auth**
   - Login on marketing site → Access web app → Same session

## 📝 Notes

- Keep both apps on same Clerk instance
- Use same Stripe account for both environments
- Database must be accessible from both apps
- Consider Redis for real-time usage tracking
- Implement proper error handling for payment failures

## 🔗 Important Links

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Integration Plan](./CLERK-INTEGRATION-PLAN.md)
- [Database Schema](./website/src/lib/db/schema.sql)

## ⚠️ Before Merging

- [ ] All tests passing
- [ ] Stripe webhook tested
- [ ] Usage tracking accurate
- [ ] Cross-domain auth working
- [ ] Documentation updated
- [ ] Environment variables documented