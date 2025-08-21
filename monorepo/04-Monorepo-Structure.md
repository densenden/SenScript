# Step 4 — Monorepo Structure & Shared Styling

```
/apps
  /web        # Next.js 14 (marketing + app)
  /mobile     # React Native (Expo)
  /desktop    # Electron (frameless, rounded)
/packages
  /core       # @senscript/core (LLM manager, card builder, prompts)
  /ui         # Tailwind tokens, components, icons, themes
/infra
  /supabase   # SQL, policies, edge functions
  /railway    # Fastify provider hub (optional)
```

## Shared Styling
- `packages/ui/tailwind.config.ts` exports theme with **large radii**, glass morphism, brand colors.
- Both `/apps/web` and `/apps/mobile` import tokens (with RN using a mapping layer).

## Build Scripts
- `pnpm build` → runs builds with turbo across apps.
- `pnpm dev --filter apps/web` → web dev.
- `pnpm dev --filter apps/mobile` → expo dev.
