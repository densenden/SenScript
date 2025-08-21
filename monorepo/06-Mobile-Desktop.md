# Step 6 — Mobile & Desktop

## React Native (Expo)
- Reuse `@senscript/core`.
- STT via native modules or cloud STT.
- Auth via `@supabase/supabase-js`.
- Billing UX mirrors web; **purchases** via StoreKit/Google Billing (recommend **RevenueCat** to unify entitlements with Stripe on web/desktop).

## Desktop App — Frameless + Large Radii
- Use **Electron** (or **Tauri**) for best control.
- Create a **frameless** window (`frame: false`) and add rounded corners with CSS and transparent window; custom draggable regions for window movement.
- Load either the Next.js app URL or a packaged build.
- Title bar hidden; provide your custom toolbar inside the app shell.

### Why not React-Native Desktop only?
- RN-macOS/Windows exist but **window chrome & deep OS features** are more flexible/stable in Electron/Tauri, especially for frameless + rounded UI across platforms.
