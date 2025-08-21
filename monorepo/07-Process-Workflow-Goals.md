# Step 7 — Process, Workflow & Goals

## Product Goals
- **Speed-first**: average card creation < 3s.
- **Reliability**: ≥ 99% successful session start.
- **Monetization**: conversion Free → Paid ≥ 5%; churn < 5%/mo.
- **Cross-platform parity**: same card experience on web/mobile/desktop.

## Development Workflow
1. **Issue-driven** sprints (Linear/Jira).
2. **Feature flags** for risky changes.
3. **CI/CD** with Turbo + GitHub Actions (lint/test/build/deploy).
4. **Observability**: Sentry + PostHog; stripe revenue dashboard; supabase logs.
5. **Security**: RLS enforced; server owns metered usage; no provider keys in client.

## Definition of Done (per feature)
- Unit tests (core functions).
- E2E happy path on Web + RN + Desktop shell.
- Docs updated in `/docs`.
- Telemetry events defined & verified.

## Risk Log (examples)
- Browser STT variability → provide Cloud STT fallback.
- App store review rules → use native IAP on mobile (no Stripe links).
- Minute rounding → batch in 6s slices for fairness.
