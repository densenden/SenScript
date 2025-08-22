# SenScript Clerk & Payment Integration Plan

## 🎯 Goal
Unified authentication and subscription management across:
1. **Marketing Site** (senscript.com) - Sign up, manage subscription, buy boosts
2. **Web App** (script.sen.studio) - Use the product with active subscription

## 🔐 Authentication Architecture

### Shared Clerk Instance
Both apps will share the SAME Clerk application to maintain user sessions:

```
┌─────────────────────────────────────────┐
│         Clerk Dashboard                  │
│    (Single Clerk Application)            │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│Marketing│      │ Web App │
│  Site   │      │(script) │
└─────────┘      └─────────┘
```

### Implementation Steps

#### 1. Marketing Site (Current)
- ✅ Clerk authentication configured
- ✅ User dashboard created
- ✅ API routes for user profile
- ⚠️ Need: Stripe checkout integration
- ⚠️ Need: Subscription management

#### 2. Web App (script.sen.studio)
- 🔄 Need: Install Clerk SDK
- 🔄 Need: Wrap app with ClerkProvider
- 🔄 Need: Check authentication on app load
- 🔄 Need: Track usage minutes in real-time
- 🔄 Need: Block transcription for non-authenticated users

### Environment Configuration

Both apps need these SAME Clerk keys:
```env
# .env for both apps
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aHVtb3JvdXMtcGlyYW5oYS0zNy5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_P9ExsHIlvrfrKP0zbsdx8g2SDMsaniVZyvYzC86CnI

# Shared API endpoint
NEXT_PUBLIC_API_URL=https://api.senscript.com  # Or your backend
```

## 💳 Payment & Subscription System

### Subscription Tiers

| Plan | Price | Minutes | Features |
|------|-------|---------|----------|
| **Free Trial** | €0 | 90 min (once) | Basic features |
| **Essential** | €9/mo | 600 min/mo | All features |
| **Professional** | €29/mo | 2500 min/mo | Priority support |
| **Enterprise** | Custom | Unlimited | Custom integration |
| **Boost** | €1 | 15 min (one-time) | Quick top-up |

### Stripe Products Setup

```javascript
// Stripe Product IDs (to be created in Stripe Dashboard)
const PRODUCTS = {
  boost_15min: 'price_boost15min',      // €1 one-time
  essential_monthly: 'price_essential',  // €9/month
  professional_monthly: 'price_pro',     // €29/month
  enterprise: 'price_enterprise'         // Custom
};
```

### Database Schema Requirements

```sql
-- Extended subscriptions table
ALTER TABLE subscriptions ADD COLUMN 
  stripe_price_id TEXT,
  minutes_purchased INTEGER DEFAULT 0,  -- For boosts
  minutes_rollover INTEGER DEFAULT 0,   -- Unused from prev month
  last_boost_at TIMESTAMP;

-- Boost purchases table
CREATE TABLE boost_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  stripe_payment_intent_id TEXT,
  minutes INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 User Flow

### New User Journey
1. **Marketing Site**: User signs up via Clerk OAuth
2. **Clerk**: Creates user account, returns to marketing site
3. **Marketing Site**: Creates user in database with 90 free minutes
4. **User Dashboard**: Shows usage, upgrade options
5. **Web App Access**: User clicks "Start SenScript"
6. **Web App**: Detects Clerk auth, allows transcription
7. **Usage Tracking**: Real-time minute deduction

### Subscription Purchase Flow
1. **Marketing Site**: User clicks "Upgrade" 
2. **Stripe Checkout**: Hosted checkout page
3. **Webhook**: Stripe notifies subscription created
4. **Database**: Update user's plan and minutes
5. **Web App**: Instantly reflects new limits

### 15-Minute Boost Flow
1. **Low Minutes Warning**: Alert at <5 minutes remaining
2. **Quick Purchase**: One-click €1 boost button
3. **Stripe Payment**: Card on file or quick checkout
4. **Instant Credit**: 15 minutes added immediately
5. **Continue Working**: No interruption to session

## 🏗️ Implementation Plan

### Phase 1: Web App Authentication (Day 1)
```bash
cd script-sen-studio
npm install @clerk/nextjs
```

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Phase 2: Usage Tracking API (Day 2)
```typescript
// api/usage/track
export async function POST(req: Request) {
  const { userId } = auth();
  const { minutes, sessionId } = await req.json();
  
  // Deduct minutes from user's balance
  await db.subscriptions.update({
    where: { userId },
    data: { 
      minutes_used: { increment: minutes }
    }
  });
  
  return json({ success: true });
}
```

### Phase 3: Stripe Checkout (Day 3)
```typescript
// api/stripe/create-checkout
export async function POST(req: Request) {
  const { priceId, mode } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: mode, // 'subscription' or 'payment'
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${BASE_URL}/dashboard?success=true`,
    cancel_url: `${BASE_URL}/pricing`,
    metadata: { userId }
  });
  
  return json({ url: session.url });
}
```

### Phase 4: Boost Purchase (Day 4)
```typescript
// Quick boost purchase with saved card
export async function purchaseBoost(userId: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100, // €1 in cents
    currency: 'eur',
    customer: user.stripeCustomerId,
    payment_method: user.defaultPaymentMethod,
    confirm: true,
    metadata: { 
      userId,
      type: 'boost',
      minutes: 15
    }
  });
  
  // Add minutes immediately
  await addBoostMinutes(userId, 15);
}
```

## 🚀 Deployment Strategy

### Environment Setup
1. **Production Clerk App**: Create at clerk.com
2. **Production Stripe**: Set up products and prices
3. **Shared Database**: PostgreSQL or Supabase
4. **API Gateway**: Shared endpoints for both apps

### CORS Configuration
```javascript
// Allow both domains to access API
const corsOptions = {
  origin: [
    'https://senscript.com',
    'https://script.sen.studio',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
};
```

## ⚠️ Critical Considerations

### Security
- **JWT Verification**: Always verify Clerk tokens server-side
- **Rate Limiting**: Prevent usage tracking abuse
- **Webhook Validation**: Verify Stripe webhook signatures

### User Experience
- **Grace Period**: Allow 1-2 min overdraft before cutting off
- **Warning System**: Alert at 10, 5, and 1 minute remaining
- **Offline Mode**: Cache authentication for 5 minutes
- **Fast Checkout**: Save payment methods for one-click boosts

### Business Logic
- **Rollover Policy**: Unused minutes don't roll over (except Enterprise)
- **Refund Policy**: Pro-rated refunds for annual plans
- **Trial Restrictions**: One trial per email/payment method
- **Boost Limits**: Max 5 boosts per day to prevent abuse

## 📊 Monitoring & Analytics

Track these metrics:
- User sign-ups and conversions
- Average usage per plan
- Boost purchase frequency
- Churn rate by plan
- Session length distribution
- Feature usage by plan

## 🔧 Testing Checklist

- [ ] User can sign up on marketing site
- [ ] User can access web app with same login
- [ ] Minutes decrease during transcription
- [ ] User blocked when minutes = 0
- [ ] Subscription purchase works
- [ ] Boost purchase adds minutes instantly
- [ ] Webhook updates database correctly
- [ ] Cross-domain authentication works
- [ ] Mobile app authentication works

## 📝 Next Steps

1. **Immediate**: Commit current work
2. **Today**: Create payment branch
3. **Tomorrow**: Implement web app auth
4. **This Week**: Complete Stripe integration
5. **Next Week**: Launch with payment system