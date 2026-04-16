-- =====================================================
-- ALERTIFY — Supabase Schema
-- Run this entire file in your Supabase SQL editor:
-- supabase.com → your project → SQL Editor → New query
-- =====================================================

-- ALERTS TABLE
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  site text not null,
  alert_type text not null check (alert_type in ('stock', 'price')),
  min_price numeric(10, 2),
  max_price numeric(10, 2),
  status text not null default 'active' check (status in ('active', 'triggered', 'paused', 'error')),
  product_name text,
  product_image text,
  current_price numeric(10, 2),
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  sent_at timestamptz not null default now(),
  trigger_value text
);

-- =====================================================
-- ROW LEVEL SECURITY — Alerts
-- =====================================================
alter table public.alerts enable row level security;

create policy "Users can view own alerts"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert own alerts"
  on public.alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on public.alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on public.alerts for delete
  using (auth.uid() = user_id);

-- =====================================================
-- ROW LEVEL SECURITY — Notifications
-- =====================================================
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Service role can insert notifications (from cron)
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- =====================================================
-- INDEXES for performance
-- =====================================================
create index if not exists alerts_user_id_idx on public.alerts(user_id);
create index if not exists alerts_status_idx on public.alerts(status);
create index if not exists notifications_alert_id_idx on public.notifications(alert_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
