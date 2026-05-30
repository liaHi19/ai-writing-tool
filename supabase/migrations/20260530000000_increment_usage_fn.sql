-- increment_usage: atomic per-day usage counter.
-- A single-statement upsert avoids a TOCTOU race between concurrent
-- generations (read-then-write could let both read the same count).
-- SECURITY INVOKER (default) so usage_daily RLS still applies to the caller.
create or replace function public.increment_usage(p_user_id uuid, p_day date)
returns integer
language sql
as $$
  insert into public.usage_daily (user_id, day, count)
  values (p_user_id, p_day, 1)
  on conflict (user_id, day)
  do update set count = public.usage_daily.count + 1
  returning count;
$$;

grant execute on function public.increment_usage(uuid, date) to authenticated;
