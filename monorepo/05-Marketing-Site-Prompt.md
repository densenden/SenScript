# Step 5 — Prompt to Generate the Marketing Website (React + Tailwind)

**Role**: Senior Frontend Engineer & Designer.  
**Goal**: Create a **React (Next.js)** marketing site that showcases **all advantages**, a **live-ish demo section**, **pricing**, and **about** — with **Tailwind** and a cohesive visual system. It must be production-ready and deposited under `/apps/web` using shared design tokens from `/packages/ui`.

**Constraints**:
- Use **App Router**.
- Pages: `/`, `/demo`, `/pricing`, `/about`.
- Common layout (`/apps/web/app/(site)/layout.tsx`) and shared components (`packages/ui`): `Button`, `Card`, `Section`, `PricingTable`, `FeatureGrid`, `Header`, `Footer`.
- Styling: Large corner radii (2xl+), soft shadows, glass overlays, responsive grid, accessible contrasts.
- Do **not** mention tokens/models/context windows anywhere on the public site.
- Include CTA buttons to **Start Free** and **Open Billing Portal** (Portal wired later).

**Deliver**:
1. `app/(site)/layout.tsx`, `app/(site)/page.tsx` (hero + feature grid + CTA)
2. `app/(site)/demo/page.tsx` (fake demo with transcript stream simulator)
3. `app/(site)/pricing/page.tsx` (tiers matching Stripe)
4. `app/(site)/about/page.tsx` (mission, speed-first, privacy)
5. `packages/ui` components + Tailwind theme (colors, radii, spacing)
