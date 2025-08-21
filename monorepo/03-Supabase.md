# Step 3 — Supabase Schema & Policies

Run with `supabase db push` from `/infra/supabase`.

```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text default 'en',
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text check (provider in ('stripe')) default 'stripe',
  status text check (status in ('trialing','active','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  customer_id text,
  price_id text,
  subscription_id text unique,
  created_at timestamptz default now()
);

create table if not exists public.plans (
  price_id text primary key,
  name text not null,
  included_minutes int not null,
  overage_eur_per_min numeric(6,3) not null default 0.066
);

create table if not exists public.minute_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  included_remaining int not null,
  topup_remaining int not null default 0,
  consumed_minutes int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.usage_stats (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  provider text,
  total_calls int default 0,
  total_tokens int default 0,
  minutes int default 0,
  day date default current_date
);

-- RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plans enable row level security;
alter table public.minute_balances enable row level security;
alter table public.usage_stats enable row level security;

create policy "own_profiles" on public.profiles
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own_subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "own_balances" on public.minute_balances
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own_usage" on public.usage_stats
  for select using (auth.uid() = user_id);
```

## Edge Functions
- `webhooks/stripe` — upsert subscriptions, reset balances on new period, add reload minutes.
- `billing/usage` — server reports minute deltas (and writes Stripe usage record).
