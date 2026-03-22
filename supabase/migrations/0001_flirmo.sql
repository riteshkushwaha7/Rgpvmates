create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  age int check (age is null or age >= 18),
  gender text check (gender in ('man', 'woman', 'non-binary', 'prefer-not-to-say')),
  city text,
  bio text,
  interests text[] default '{}',
  avatar_url text,
  photos text[] default '{}',
  is_admin boolean not null default false,
  is_hidden boolean not null default false,
  is_suspended boolean not null default false,
  suspension_reason text,
  onboarding_completed boolean not null default false,
  subscription_plan text not null default 'free' check (subscription_plan in ('free', 'monthly', 'yearly')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive', 'active', 'expired', 'failed')),
  subscription_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  swiped_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, swiped_id)
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_user_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount int not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'inactive' check (status in ('inactive', 'active', 'expired', 'failed')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  period_start timestamptz,
  period_end timestamptz,
  no_refund_acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.blocks enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

create policy "profiles own read or public discoverable"
on public.profiles
for select
using (
  auth.uid() = id
  or (
    is_hidden = false
    and is_suspended = false
    and auth.uid() is not null
  )
  or public.is_admin()
);

create policy "profiles own update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id and (age is null or age >= 18));

create policy "profiles own insert"
on public.profiles
for insert
with check (auth.uid() = id and (age is null or age >= 18));

create policy "swipes own access"
on public.swipes
for all
using (auth.uid() = swiper_id or public.is_admin())
with check (auth.uid() = swiper_id);

create policy "blocks own access"
on public.blocks
for all
using (auth.uid() = blocker_id or public.is_admin())
with check (auth.uid() = blocker_id);

create policy "matches matched users only"
on public.matches
for select
using (auth.uid() in (user_a, user_b) or public.is_admin());

create policy "matches owner insert"
on public.matches
for insert
with check (auth.uid() in (user_a, user_b));

create policy "messages matched users only"
on public.messages
for select
using (
  exists (
    select 1 from public.matches
    where matches.id = messages.match_id
      and auth.uid() in (matches.user_a, matches.user_b)
  )
  or public.is_admin()
);

create policy "messages sender insert"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.matches
    where matches.id = messages.match_id
      and auth.uid() in (matches.user_a, matches.user_b)
  )
);

create policy "reports reporter insert"
on public.reports
for insert
with check (auth.uid() = reporter_id);

create policy "reports own or admin read"
on public.reports
for select
using (auth.uid() = reporter_id or public.is_admin());

create policy "reports admin update"
on public.reports
for update
using (public.is_admin())
with check (public.is_admin());

create policy "contact admin read"
on public.contact_submissions
for select
using (public.is_admin());

create policy "contact anonymous insert"
on public.contact_submissions
for insert
with check (true);

create policy "contact admin update"
on public.contact_submissions
for update
using (public.is_admin())
with check (public.is_admin());

create policy "payments own read"
on public.payments
for select
using (auth.uid() = user_id or public.is_admin());

create policy "payments admin write"
on public.payments
for all
using (public.is_admin())
with check (public.is_admin());
