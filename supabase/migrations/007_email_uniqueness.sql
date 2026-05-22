-- Migration 007: Email uniqueness check
-- Adds a security-definer function to check if an email is already registered
-- in auth.users, so the sign-up page can prevent duplicate accounts.

create or replace function public.is_email_registered(email_input text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1
    from auth.users
    where lower(email) = lower(email_input)
  );
end;
$$;

-- Grant execute to anon + authenticated so the RPC works from both contexts
grant execute on function public.is_email_registered(text) to anon;
grant execute on function public.is_email_registered(text) to authenticated;
