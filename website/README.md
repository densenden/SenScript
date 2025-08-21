# SenScript Marketing Website

A comprehensive Next.js marketing website showcasing SenScript's AI-powered CheatCard generation technology.

## 🎯 Overview

**Product**: SenScript - AI-Powered Real-Time Flashcard Generator  
**Primary Focus**: CheatCard Interview Mode for strategic advantages  
**Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Framer Motion  

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit: http://localhost:3000

## 📁 Project Structure

```
website/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── about/               # About page with use cases
│   │   ├── demo/                # Interactive demo page
│   │   ├── pricing/             # Pricing with Stripe integration
│   │   ├── api/                 # API routes
│   │   │   └── stripe/          # Stripe webhook endpoint
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   └── CheatCard.tsx    # Main CheatCard component
│   │   ├── sections/            # Page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── CheatCardShowcase.tsx
│   │   │   ├── FeatureGrid.tsx
│   │   │   └── UseCases.tsx
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/                     # Utilities and configurations
│   │   ├── constants.ts         # CheatCard categories, pricing tiers
│   │   ├── cheatcard-api.ts     # API integration
│   │   └── stripe.ts           # Stripe configuration
│   └── hooks/                   # Custom React hooks
├── public/                      # Static assets
│   ├── images/                  # Screenshots and branding
│   └── animations/             # Animation files
├── .env.local.example          # Environment variables template
└── WEBSITE-STRATEGY.md         # Comprehensive strategy document
```

## 🎨 Key Features

### Core Pages

1. **Homepage** (`/`) - Hero section with animated CheatCard preview
2. **Interactive Demo** (`/demo`) - Real-time speech recognition and card generation
3. **Pricing** (`/pricing`) - Three-tier pricing with Stripe integration
4. **About** (`/about`) - Detailed CheatCard philosophy and use cases

### CheatCard Component
- 3D flip animation with CSS transforms
- Category-based color coding (7 categories)
- Confidence scoring display
- Language flags (13 languages supported)
- Interview/Standard mode styling

## 🔧 Configuration

### Environment Variables

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SenScript API
SENSCRIPT_API_URL=http://localhost:3002
SENSCRIPT_API_KEY=your_api_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://senscript.ai
```

### Stripe Webhook
URL: `https://script.sen.studio/api/stripe`

## 🎯 CheatCard Categories

1. **Interview Tip** 💡 - Strategic interview advice
2. **Key Facts** 📊 - Important data points
3. **Quick Win** ⚡ - Simple tactics that impress
4. **What to Say** ✅ - Recommended phrases
5. **Avoid This** ⚠️ - Common mistakes
6. **Concept** 🧠 - Key definitions
7. **Meeting Tip** 🎯 - Meeting strategies

## 🌍 Language Support

13 languages with auto-detection:
German 🇩🇪, English 🇺🇸, French 🇫🇷, Spanish 🇪🇸, Italian 🇮🇹, Portuguese 🇵🇹, Dutch 🇳🇱, Russian 🇷🇺, Chinese 🇨🇳, Japanese 🇯🇵, Korean 🇰🇷, Arabic 🇸🇦, Greek 🇬🇷

## 📱 Design System

- **Colors**: Primary Orange (#f97316), Glass morphism effects
- **Typography**: Inter font family with responsive sizing
- **Animations**: 3D card flips, smooth transitions, entrance effects
- **Layout**: Mobile-first, fully responsive, accessible

## 🚀 Deployment

1. Copy `.env.local.example` to `.env.local`
2. Fill in all required environment variables
3. Set up Stripe products and webhooks
4. Deploy to Vercel or your preferred platform

```bash
npm run build
npm run start
```

## 📊 Important Notes

- **Real Content**: All examples use actual exported cards from SenScript app
- **CheatCard Focus**: Emphasizes strategic advantage over traditional flashcards
- **Studio Sen Integration**: Proper attribution and ecosystem links
- **API Ready**: Real backend integration for demo functionality

---

**Built by Studio Sen** | **Powered by SenScript Technology**
