# Step 1 — Bootstrap, Clone & Tooling

## 1. Clone the Vercel Starter (Next.js Subscription Payments)
```bash
# in an empty parent folder
git clone https://github.com/vercel/nextjs-subscription-payments.git senscript
cd senscript
```

## 2. Turn it into a Monorepo (pnpm + Turborepo)
```bash
npm i -g pnpm
pnpm init -y
pnpm add -D turbo
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false },
    "lint": {},
    "test": {}
  }
}
```

Restructure:
```
/apps
  /web          # Next.js app (marketing + app)
  /billing      # (Option) vanilla starter kept separate, or merge into /web
  /desktop      # Electron shell (later)
  /mobile       # React Native (Expo) app
/packages
  /core         # @senscript/core (shared logic)
  /ui           # shared Tailwind config, tokens, components
/infra
  /supabase     # SQL, policies, functions
  /railway      # Provider hub (optional)
```

Move starter into `/apps/web` or `/apps/billing` and wire workspace with `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "infra/*"
```

## 3. Install CLIs (Stripe, Supabase, Git, MCP optional)
```bash
# Stripe
npm i -g stripe
stripe --version

# Supabase
npm i -g supabase
supabase --version

# Git already present? else:
# macOS: brew install git

# MCP (optional; Model Context Protocol server configs)
# use if your IDE/agent supports MCP tools for Stripe/Supabase
pnpm add -D @modelcontextprotocol/sdk
```

Create basic `mcp.json` (optional):
```json
{
  "client": "cursor-or-your-agent",
  "servers": {
    "stripe": { "command": "stripe", "args": ["listen"] },
    "supabase": { "command": "supabase", "args": ["db", "start"] }
  }
}
```

> MCP is optional. It’s a developer convenience to expose Stripe/Supabase commands as agent tools.

## 4. Environment Variables Skeleton
Create `.env.local` in `/apps/web`:
```
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://XYZ.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://app.senscript.dev
```

## 5. Shared UI & Tailwind
In `/packages/ui`, add `tailwind.config.ts`, tokens, and base CSS. Then consume in `/apps/web` with a single Tailwind setup so **marketing + app** share styles.
