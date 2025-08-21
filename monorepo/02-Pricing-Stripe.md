# Step 2 — Pricing, Stripe Setup & Products

## Tiers
- **Free** — 0 €, 90 visible minutes (internally 100)
- **Essential** — 9.99 €/mo, 200 minutes included, overage 0.066 €/min
- **Premium** — 17.99 €/mo, 500 minutes included, overage 0.066 €/min
- **Reload 15** — 1.00 € one-time → +15 minutes (optional on top of overage)

## Stripe Objects
- Products: `senscript_essential`, `senscript_premium`, `senscript_reload15`
- Prices:
  - Recurring **metered** (essential, premium) with included units (200 / 500)
  - One-time `reload15` (top-up) for +15 minutes
- Enable **Stripe Tax** and Customer Portal.

## CLI (example)
```bash
stripe login
# create products/prices in dashboard (recommended) or via CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Webhook Events to Handle
- `checkout.session.completed`
- `customer.subscription.updated|deleted`
- `invoice.paid` (period reset)
- (metered) `usage_record.summary.created` (optional logging)

## Usage Records (metered)
Server increments used minutes:
```ts
await stripe.subscriptionItems.createUsageRecord(subItemId, {
  quantity: minutesDelta,
  timestamp: Math.floor(Date.now()/1000),
  action: 'increment'
})
```
