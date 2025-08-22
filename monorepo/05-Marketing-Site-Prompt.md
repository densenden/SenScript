# Step 5 — Prompt to Generate the Marketing Website (React + Tailwind)

**Role**: Senior Frontend Engineer & Designer.  
**Goal**: Create a **React (Next.js)** marketing site that showcases **all advantages**, a **live-ish demo section**, **pricing**, and **about** — with **Tailwind** and a cohesive visual system. It must be production-ready and deposited under `/website` using shared design tokens from `/packages/ui`.

**Constraints**:
- Use **App Router**.
- Pages: `/`, `/demo`, `/pricing`, `/about`.
- Common layout (`/apps/web/app/(site)/layout.tsx`) and shared components (`packages/ui`): `Button`, `Card`, `Section`, `PricingTable`, `FeatureGrid`, `Header`, `Footer`.
- Styling: Large corner radii (2xl+), soft shadows, glass overlays, responsive grid, accessible contrasts.
- Do **not** mention tokens/models/context windows anywhere on the public site.
- Include CTA buttons to **Start Free** and **Open Billing Portal** (stripe keys ready, create real checkout process, with integration of resend, create designsystem compliant mails with logo).

**Deliver**:
1. `app/(site)/layout.tsx`, `app/(site)/page.tsx` (hero + feature grid + CTA)
2. `app/(site)/demo/page.tsx` (real demo from web-app folder with transcript stream simulator)
3. `app/(site)/pricing/page.tsx` (tiers matching Stripe)
4. `app/(site)/about/page.tsx` (mission, speed-first, privacy)
5. `packages/ui` components + Tailwind theme (colors, radii, spacing)


# SenScript Marketing Website - Complete Technical Strategy & Implementation Guide

## Project Overview

**Product**: SenScript - AI-Powered Real-Time CheatCard Generator  
**Goal**: Production-ready React marketing website with systematic design and rich personas  
**Status**: Ready for complete rebuild with proper foundation  
**Tech Stack**: **React 18+ with Next.js 15.5.0** (Turbopack), TypeScript, TailwindCSS, Material Icons, Glass Morphism UI

## CRITICAL: Design System Foundation

### Glass Container System (Based on web-app folder)
```css
/* Primary Glass Effect */
.glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.light .glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #1f2937;
}

/* Theme-Inverted Navbar (WHITE in dark mode, DARK in light mode) */
.navbar-glass {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.dark .navbar-glass {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### Systematic Spacing System
```css
/* Container with proper spacing */
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 120px 20px; /* Space for navbar & footer */
  gap: 32px; /* Generous section spacing */
}

/* Spacing utilities */
.space-section { margin-bottom: 48px; }
.space-large { margin-bottom: 32px; }
.space-medium { margin-bottom: 24px; }
.space-small { margin-bottom: 16px; }
.space-xs { margin-bottom: 8px; }

/* Content alignment */
.content-center { text-align: center; }
.content-max-width { max-width: 800px; margin: 0 auto; }
.content-max-width-large { max-width: 1000px; margin: 0 auto; }

/* Grid system */
.section-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .section-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .section-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}
```

### Color System (MINIMAL - Orange Accent Only)
```css
/* Primary colors */
--orange-500: #f97316;
--orange-600: #ea580c;
--gray-600: #4b5563; /* For icons */
--text-primary: inherit; /* Let glass handle text colors */

/* Button system */
.btn-primary {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 12px 24px;
}
```

### Material Icons System
```css
.material-symbols-outlined,
.material-icons {
  font-family: 'Material Symbols Outlined';
  font-weight: 100;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
}

.icon-sm { font-size: 18px; }
.icon-md { font-size: 24px; }
.icon-lg { font-size: 32px; }
```

### Dark/Light Mode System
- **Dark Mode (default)**: Blue gradient background, white text, glass containers
- **Light Mode**: White/gray background, dark text, inverted glass containers  
- **Navbar**: Theme-inverted (white in dark, dark in light)
- **Auto-detection**: `(prefers-color-scheme: dark)` with localStorage override  

## Core Value Propositions

### Primary USP: **"Turn Any Conversation Into Instant Study Materials"**
- **Speed-First Architecture**: Sub-3-second card generation
- **Universal Compatibility**: Works with ANY audio source (Teams, Zoom, phone calls, lectures)
- **13-Language Support**: Real-time multilingual processing
- **AI-Powered Intelligence**: Context-aware educational content

### Secondary USPs:
1. **Interview Test Companion Mode**: Strategic prep for job interviews and exams - CheatCard mode
2. **Real-Time Learning**: No post-processing delays - cards appear during live conversations
3. **Privacy-First**: Local processing with optional cloud AI
4. **Chrome Extension**: Works in any web browser tab

## CheatCard Interview Mode - Key Feature

**What is CheatCard Mode?**
CheatCard Mode is SenScript's specialized interview preparation feature that transforms any conversation, lecture, or meeting content into strategic "cheat cards" optimized for interview success and exam preparation.

**How CheatCards Differ from Regular Flashcards:**
- **Strategic Focus**: Instead of basic Q&A, CheatCards provide tactical interview responses
- **Real-World Application**: Cards include "what to say" vs "what NOT to say" guidance
- **Context-Aware**: Adapts to interview type (technical, behavioral, industry-specific)
- **Quick-Reference Format**: Designed for last-minute review before interviews

**CheatCard Categories:**
1. **Interview Tip**: Strategic advice for handling specific interview questions
2. **Key Facts**: Important data points to mention during interviews  
3. **What to Say**: Recommended phrases and talking points
4. **Avoid This**: Common mistakes and what not to say
5. **Quick Win**: Simple tactics that impress interviewers

**Real Examples from Exports:**

**Interview Tip CheatCard:**
- Front: "How to respond to questions about customer acquisition cost, scaling plans, and burn rate when seeking startup funding?"
- Back: "Provide concrete data on acquisition costs, growth plans, competitive advantages, financial sustainability, and profitability projections. Demonstrating clear metrics and viable path to profitability instills investor confidence."

**Quick Win CheatCard:**  
- Front: "How can you improve your pronunciation of the 'ö' sound in Swedish during a language interview?"
- Back: "Practice 'förr' (before) vs 'får' (sheep) - 'ö' is like 'e' in 'her' but with rounded lips. This demonstrates attention to detail and language precision."

**Key Facts CheatCard:**
- Front: "What notable fact about Finnish education system should you mention in an education interview?"
- Back: "Finnish students start reading at 7 but excel in PISA tests due to emphasis on play, creativity, and critical thinking over standardized testing in early education."

## PROVEN PERSONAS (Match Image Assets)

### Rich Success Stories Format
**Assets**: sarah.png, marcus.png, lisa.png (in /public/images/)

### Sarah Chen - Staff Engineer at Stripe
- **Challenge**: Stuck at senior level for 2+ years, struggling with system design interviews
- **Solution**: Used SenScript during architecture reviews to capture staff-level communication patterns
- **Result**: 127 Strategic Cards → Staff Promotion in 6 months, $45k salary increase
- **Quote**: "I captured patterns in how staff engineers explain trade-offs during architecture reviews."

### Marcus Rodriguez - Senior PM at Notion  
- **Challenge**: Startup PM wanting to move to big tech, struggled with strategic thinking articulation
- **Solution**: Used SenScript during executive meetings, customer calls, competitor analysis
- **Result**: 203 Strategy Cards → Landed Senior PM role at Notion, led $2M product launch
- **Quote**: "SenScript captured executive-level insights that became my interview advantage."

### Lisa Weber - Research Scientist at DeepMind
- **Challenge**: PhD candidate struggling to synthesize 4 years of research into defense narrative
- **Solution**: SenScript transformed advisor meetings into structured knowledge cards
- **Result**: 156 Research Cards → Successfully defended PhD → DeepMind Research Scientist
- **Quote**: "Advisor meetings became structured study materials that turned scattered insights into coherent academic story."

## Footer Strategy (Based on commerce.sen.studio pattern)

### Footer Structure (Glass-themed)
```typescript
const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Live Demo', href: '/demo' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'About', href: '/about' },
      { name: 'Features', href: '/#features' },
    ]
  },
  {
    title: 'Company', 
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: 'https://sen.studio/contact' }, // External
      { name: 'Studio Sen', href: 'https://sen.studio' }, // External
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Support', href: 'https://sen.studio/support' }, // External
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: 'https://sen.studio/legal/privacy.html ' }, // External
      { name: 'Terms of Service', href: 'https://sen.studio/legal/terms.html' }, // External
      { name: 'Imprint', href: 'https://sen.studio/legal/imprint.html' }, // External
      { name: 'GDPR', href: 'https://sen.studio/gdpr' }, // External
    ]
  }
];
```


### Legal Footer Bar
```html
© 2025 Studio Sen. All rights reserved. • SOC 2 Compliant • Privacy • Terms • GDPR
```

## Website Structure & Systematic Layouts

### 1. Homepage (`/`)
```html
<main>
  <div className="container">
    <!-- Hero Section -->
    <section className="glass p-5 content-center">
      <div className="content-max-width">
        <h1>Turn Any <span className="text-orange-500">Conversation</span> Into Study Materials</h1>
        <p>AI-powered flashcard generation from live conversations...</p>
        <div className="space-medium">
          <a href="/demo" className="btn btn-primary">Try Live Demo</a>
          <a href="/about" className="btn">Learn More</a>
        </div>
      </div>
    </section>

    <!-- Key Benefits -->
    <section className="section-grid">
      <div className="glass p-5">
        <span className="material-symbols-outlined icon-lg text-orange-500">bolt</span>
        <h3>Sub-3s Generation</h3>
        <p>Real-time flashcard creation from any conversation...</p>
      </div>
      <!-- More benefit cards... -->
    </section>

    <!-- Rich Personas Section -->
    <section className="content-max-width-large">
      <div className="glass p-5">
        <div className="content-center space-large">
          <h2>How SenScript Transforms Careers</h2>
        </div>
        <div className="section-grid">
          <!-- Sarah, Marcus, Lisa persona cards with images... -->
        </div>
      </div>
    </section>

    <!-- Universal Compatibility -->
    <section className="glass p-5 content-max-width-large">
      <div className="content-center space-large">
        <h2>Works Everywhere, With Everything</h2>
      </div>
      <div className="section-grid">
        <!-- Platform cards with Material Icons... -->
      </div>
    </section>

    <!-- Final CTA -->
    <section className="glass p-5 content-center">
      <h2>Ready to Never Miss an Opportunity Again?</h2>
      <!-- CTA buttons... -->
    </section>
  </div>
</main>
<Footer />
```

### 2. About Page (`/about`) 
- **Hero**: CheatCard Technology philosophy
- **Journey**: Discovery → Innovation → Revolution → Impact (with Material Icons)
- **Features**: Speed-First Architecture, Real-Time Intelligence, Strategic Advantage
- **Personas**: Same rich stories as homepage but with different angle
- **Technical Deep Dive**: Universal Audio Capture explanation
- **Vision**: Speed First, Strategic Intelligence, Universal Access

### 3. Pricing Page (`/pricing`)
- **Header**: Choose Your Success Plan
- **Plans**: Free ($0), Essential ($12), Premium ($29) with CheatCard focus
- **Value Props**: Lightning Fast, AI-Powered Intelligence, Privacy First
- **Testimonials**: Sarah, Marcus, Lisa with ratings and strategic quotes
- **FAQ**: 8 comprehensive Q&As about features and billing
- **Final CTA**: Money-back guarantee, cancel anytime

## Technical Implementation Requirements

### Next.js Configuration
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: __dirname
    }
  }
};
export default nextConfig;
```

### React Component Structure (All Pages)
```typescript
// src/app/layout.tsx (Next.js App Router with React)
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100" rel="stylesheet" />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

// All React page components follow this pattern:
export default function PageName() {
  return (
    <main>
      <div className="container">
        {/* React sections with systematic spacing */}
      </div>
    </main>
  );
}

// React component example structure:
'use client'; // For interactive React components

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function InteractivePage() {
  const [state, setState] = useState('');
  
  return (
    <main>
      <div className="container">
        <section className="glass p-5 content-center">
          {/* Interactive React content */}
        </section>
      </div>
    </main>
  );
}
```

### Material Icons Import (Critical)
```html
<!-- In layout.tsx head -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100" rel="stylesheet" />
```

### React File Structure (Required)
```
/website/src/
├── app/                        # Next.js 15 App Router
│   ├── layout.tsx              # Root React layout with fonts
│   ├── page.tsx                # Homepage React component
│   ├── about/page.tsx          # About page React component with personas
│   ├── pricing/page.tsx        # Pricing React component with testimonials
│   ├── demo/page.tsx           # Interactive demo React component
│   └── globals.css             # Complete design system
├── components/                 # React components
│   ├── ui/                     # Reusable UI React components
│   │   ├── Button.tsx          # React button component
│   │   ├── Card.tsx            # React card component
│   │   └── PersonaCard.tsx     # React persona component
│   ├── sections/               # Page section React components
│   │   ├── Hero.tsx            # Hero section React component
│   │   ├── Features.tsx        # Features grid React component
│   │   └── Personas.tsx        # Personas section React component
│   └── layout/                 # Layout React components
│       ├── Header.tsx          # Theme-inverted navbar React component
│       └── Footer.tsx          # Glass-themed footer React component
├── hooks/                      # Custom React hooks
│   ├── useTheme.ts             # Theme switching hook
│   └── usePersonas.ts          # Persona data hook
└── public/
    ├── images/
    │   ├── sarah.png           # Persona assets
    │   ├── marcus.png          # Persona assets
    │   └── lisa.png            # Persona assets
    ├── logo-black.svg          # Light mode logo
    └── logo-white.svg          # Dark mode logo
```

## Content Standards

### Typography Hierarchy
```css
/* All headings - NO color classes except orange accents */
h1 { font-size: 2.5rem; font-weight: 600; line-height: 1.2; }
h2 { font-size: 2rem; font-weight: 600; line-height: 1.3; }
h3 { font-size: 1.5rem; font-weight: 500; line-height: 1.4; }

/* Body text inherits glass container color */
p { line-height: 1.6; font-size: 1rem; }
```

### Icon Usage Standards
- **Material Icons ONLY** - no emojis, no Lucide icons
- **Gray-600 for neutral icons** - `text-gray-600`
- **Orange-500 for accent icons** - `text-orange-500`
- **Sizes**: `.icon-sm` (18px), `.icon-md` (24px), `.icon-lg` (32px)

### Content Tone
- **Professional but approachable**
- **Focus on career transformation**
- **Specific metrics and results**
- **No technical jargon in marketing copy**
- **Speed and strategic advantage emphasized**

## Quality Checklist

### Design System ✓
- [ ] Glass containers with proper backdrop-blur
- [ ] Theme-inverted navbar (white in dark, dark in light)
- [ ] Systematic spacing (32px gaps, proper padding)
- [ ] Material Icons with consistent sizing
- [ ] Orange accent + black/white only colors

### Content ✓
- [ ] Rich personas with images (Sarah, Marcus, Lisa)
- [ ] Systematic layout classes applied
- [ ] Footer with sen.studio legal links
- [ ] No emojis, only Material Icons
- [ ] Consistent voice and messaging

### Technical ✓
- [ ] Next.js 15.5.0 with Turbopack
- [ ] Material Icons font import
- [ ] Proper CSS @import order
- [ ] All pages follow container structure
- [ ] Responsive grid systems

---

**REACT IMPLEMENTATION PRIORITY**: 
1. CSS design system foundation
2. React layout components (Header, Footer) 
3. React homepage with persona components
4. React about page with rich interactive content
5. React pricing page with testimonial components
6. React demo page with interactive features

**SUCCESS CRITERIA**:
- Clean, professional glass morphism design system
- Engaging React persona components with interactive features
- Systematic spacing and typography across all React components
- Mobile-responsive React layouts with proper state management
- Fast loading React components with smooth animations
- Proper TypeScript typing for all React components

**CheatCard Demo Experience**:
1. **Interview Scenario Demo**: User selects interview type (Technical, Behavioral, Industry)
2. **Live CheatCard Generation**: Real-time speech recognition → CheatCard creation
3. **Mode Comparison**: Side-by-side Standard vs CheatCard mode
4. **Category Showcase**: Examples of all CheatCard categories

**Sample Interview Scenarios for Demo**:
- **Technical Interview**: "Explain the difference between REST and GraphQL..."
- **Behavioral Interview**: "Tell me about a time you handled conflict..."
- **Industry Interview**: "What trends do you see in quantum computing..."

**Demo Features**:
- Real API integration with SenScript backend
- CheatCard-specific animations and styling
- Interview mode toggle with immediate style changes
- Category-based color coding for CheatCards
- Export functionality demo showing interview prep packages

### 3. Pricing Page (`/pricing`)
**Stripe Integration + Clerk Authentication**

**Pricing Tiers** (updated with CheatCard focus):

| **Free** | **Essential** | **Premium** |
|----------|---------------|-------------|
| €0/month | €9.99/month | €17.99/month |
| 90 minutes | 200 minutes | 500 minutes |
| Basic flashcards | + CheatCard Mode | + Advanced CheatCards |
| Export to JSON | + Interview Categories | + Custom Templates |
| | €0.066/min overage | + Priority AI Processing |

**CheatCard-Specific Features**:
- Free: Basic interview preparation
- Essential: Full CheatCard mode with all categories  
- Premium: Advanced interview templates, industry-specific CheatCards

### 4. About Page (`/about`)
**CheatCard Philosophy & Detailed Use Cases**

**Mission Statement**:
"SenScript pioneered CheatCard technology - transforming any conversation into strategic interview ammunition and study materials at maximum speed."

**CheatCard Innovation Story**:
- Why traditional flashcards aren't enough for modern interviews
- How CheatCard mode provides tactical advantages
- Real success stories from interview preparation

**Detailed CheatCard Use Cases**:

**Job Interview Preparation**:
- Technical interview question breakdown
- Behavioral question strategic responses  
- Industry-specific talking points
- Salary negotiation key facts

**Academic Exam Preparation**:
- Lecture content → strategic study points
- Key facts for oral exams
- Quick-reference materials for test day

**Professional Development**:
- Conference insights → career advancement points
- Client meeting preparation
- Presentation key messages

## Authentication & User Flow

### Clerk Integration
```typescript
// Authentication flow
1. User visits website (public pages)
2. Demo page → requires sign-up for full features
3. Clerk handles: Sign-up, Sign-in, User management
4. Protected routes: /dashboard, /settings, /billing
5. Stripe integration via Clerk user IDs
```

### User Journey
1. **Discovery**: Land on homepage, see CheatCard benefits
2. **Interest**: Try limited demo, see CheatCard generation
3. **Sign-up**: Create account via Clerk for full access
4. **Trial**: Free tier with CheatCard mode trial
5. **Conversion**: Upgrade to paid for unlimited CheatCards
6. **Retention**: Export interview prep packages, advanced features

## Technical Implementation

### Enhanced Next.js Structure
```
/website
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Clerk protected routes
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── (public)/                   # Public marketing pages  
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Homepage
│   │   │   ├── demo/
│   │   │   │   └── page.tsx            # Interactive demo
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx            # Pricing with Stripe
│   │   │   └── about/
│   │   │       └── page.tsx            # CheatCard philosophy
│   │   ├── api/
│   │   │   ├── cheatcard/
│   │   │   │   └── route.ts            # CheatCard API
│   │   │   ├── stripe/
│   │   │   │   └── route.ts            # Payment webhooks
│   │   │   └── demo/
│   │   │       └── route.ts            # Demo API
│   │   ├── globals.css
│   │   └── layout.tsx                  # Root layout with Clerk
│   ├── components/
│   │   ├── ui/                         # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CheatCard.tsx           # CheatCard component
│   │   │   └── AnimatedCard.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── CheatCardShowcase.tsx   # CheatCard-specific section
│   │   │   ├── InterviewDemo.tsx       # Interview scenario demo
│   │   │   └── PricingTable.tsx
│   │   └── layout/
│   │       ├── Header.tsx              # With Clerk user menu
│   │       ├── Footer.tsx              # Studio Sen links
│   │       └── Navigation.tsx
│   ├── lib/
│   │   ├── stripe.ts                   # Stripe configuration
│   │   ├── clerk.ts                    # Clerk configuration  
│   │   ├── cheatcard-api.ts            # CheatCard API calls
│   │   └── constants.ts                # CheatCard categories, etc.
│   └── hooks/
│       ├── useCheatCard.ts             # CheatCard generation
│       └── useAuth.ts                  # Authentication state
└── public/
    ├── images/
    │   ├── cheatcard-examples/         # CheatCard screenshots
    │   ├── interview-scenarios/        # Demo screenshots
    │   └── logos/                      # SenScript branding
    └── animations/
        └── cheatcard-flip.json         # Lottie animations
```

### CheatCard Component
```typescript
interface CheatCardProps {
  category: 'INTERVIEW TIP' | 'KEY FACTS' | 'QUICK WIN' | 'WHAT TO SAY' | 'AVOID THIS';
  front: string;
  back: string;
  flag?: string;
  interviewType?: 'technical' | 'behavioral' | 'industry';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}
```

## Success Metrics

### CheatCard-Specific KPIs
- **CheatCard Generation Rate**: Cards per minute in interview mode
- **Category Distribution**: Which CheatCard types are most popular
- **Interview Success Rate**: User feedback on interview outcomes
- **Mode Usage**: Standard vs CheatCard mode adoption

### Conversion Metrics
- **Demo-to-Signup**: % users who try CheatCard demo and sign up
- **Free-to-Premium**: Focus on CheatCard feature engagement
- **Interview Prep Packages**: Export and usage rates

## Content Marketing

### SEO Strategy
**Primary Keywords**: AI interview prep, cheat cards, interview flashcards
**CheatCard-Focused**: interview cheat sheet generator, AI interview coach
**Long-tail**: real-time interview preparation cards, speech to interview notes

### Content Examples

**Homepage Headlines**:
- "Turn Any Interview Into Your Advantage"
- "Generate CheatCards From Live Conversations"  
- "Never Be Caught Off-Guard in Interviews Again"

**CheatCard Benefits**:
- "Strategic Response Templates"
- "What to Say vs What NOT to Say"
- "Industry-Specific Interview Intel"
- "Real-Time Confidence Building"

This enhanced strategy positions CheatCards as SenScript's unique differentiator, making interview preparation more strategic and effective than traditional study methods.