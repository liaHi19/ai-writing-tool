-- generations: one row per AI generation, owned by the requesting user
create table if not exists public.generations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text not null,
  input      text not null,
  output     text not null,
  model      text not null,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

create policy "generations_select_own"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "generations_insert_own"
  on public.generations for insert
  with check (auth.uid() = user_id);

-- usage_daily: per-user daily generation count for rate limiting
create table if not exists public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  count   integer not null default 0,
  primary key (user_id, day)
);

alter table public.usage_daily enable row level security;

create policy "usage_daily_select_own"
  on public.usage_daily for select
  using (auth.uid() = user_id);

create policy "usage_daily_insert_own"
  on public.usage_daily for insert
  with check (auth.uid() = user_id);

create policy "usage_daily_update_own"
  on public.usage_daily for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
