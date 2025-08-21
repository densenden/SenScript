# SenScript — Multi‑Platform Build Plan (Web, iOS/Android, Desktop)  
_Date: 2025-08-20_

This plan assumes a **working web app** and introduces a production‑grade stack: **Next.js Subscription Payments Starter (Vercel)** + **Stripe** + **Supabase** (headless) + optional **Railway** microservice. We split the work into small, sequential steps. Each step can be executed independently and committed.

---

## Milestones Overview

1. **M0 — Bootstrap & Monorepo**
   - Create monorepo (pnpm + Turborepo) with packages and apps.
   - Add Vercel’s **nextjs-subscription-payments** starter as `apps/billing` or integrate into the web app.
   - Add shared `@senscript/core` package (logic from current web app).

2. **M1 — Auth, DB & Pricing**
   - Supabase project + schema (Users, Subscriptions, Minute Balances, Usage Logs).
   - Stripe products/prices (Free/Essential/Premium + optional Reload 15).
   - Stripe → Webhooks → Supabase updates.

3. **M2 — Web App (Next.js)**
   - Marketing site (Demo, Pricing, About) — Tailwind, shared design tokens.
   - App screens (Record / Cards / Settings / Billing) using `@senscript/core`.
   - Deploy to Vercel.

4. **M3 — Mobile App (React Native + Expo)**
   - RN app using `@senscript/core` (Mic → STT → Cards).
   - Billing UX; **iOS/Android IAP via RevenueCat** or native stores; Stripe only on web/desktop.

5. **M4 — Desktop (Electron or Tauri)**
   - Desktop shell with **frameless** window (no title bar) and **large outer radii** look.
   - Load the web UI or RN-for-desktop approach (see decision below).

6. **M5 — Optional Railway Service**
   - Provider Hub for LLM routing, rate-limits, usage aggregation.
   - Avoids exposing provider keys to client.

7. **M6 — QA, Analytics, Observability**
   - Sentry, PostHog, Stripe revenue dashboard, Supabase logs.
   - End-to-end test matrix (web/mobile/desktop).

---

## Key Decisions

- **React Native vs Swift**: RN preferred now for speed and shared JS logic. Swift reserved for a future premium iOS app with on‑device STT/LLM and AVAudioSession fine control.
- **Desktop Technology**: For a **frameless** window without top program bar and rounded corners, use **Electron** (or **Tauri**). RN‑macOS is possible but less flexible for window chrome/style across platforms.
- **Minutes-based billing**: Stripe **metered billing** for paid tiers; Free tier enforced server‑side.

---

## Deliverables by Step
See individual step files (`01-Setup.md`, `02-Pricing-Stripe.md`, etc.).

