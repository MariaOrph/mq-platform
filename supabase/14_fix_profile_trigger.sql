-- Fix handle_new_user trigger to guard against empty-string company_id,
-- which would throw a ::uuid cast error and silently prevent profile creation.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_role       public.user_role;
  v_company_id uuid;
begin
  -- Safely cast role (default to 'participant' if missing or invalid)
  begin
    v_role := coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'participant'
    );
  exception when others then
    v_role := 'participant';
  end;

  -- Safely cast company_id (ignore empty string or invalid UUID)
  begin
    v_company_id := case
      when coalesce(new.raw_user_meta_data->>'company_id', '') = '' then null
      else (new.raw_user_meta_data->>'company_id')::uuid
    end;
  exception when others then
    v_company_id := null;
  end;

  insert into public.profiles (id, email, role, company_id, full_name)
  values (
    new.id,
    new.email,
    v_role,
    v_company_id,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;  -- idempotent: never overwrite an existing profile

  return new;
end;
$$;
