-- Daily content carousel: run this in the Supabase SQL Editor.

create or replace function public.is_daily_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'kshitiz2007@gmail.com',
      'admin@civilprep.in'
    )
    or exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'admin'
    );
$$;

revoke all on function public.is_daily_content_admin() from public;
grant execute on function public.is_daily_content_admin() to anon, authenticated;

create table if not exists public.daily_carousel_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('topic', 'question', 'mcq')),
  publish_date date not null default current_date,
  title text not null,
  body text not null,
  options jsonb not null default '[]'::jsonb,
  image_paths text[] not null default '{}',
  pdf_paths text[] not null default '{}',
  correct_option smallint,
  explanation text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint daily_carousel_mcq_answer_check check (
    (content_type = 'mcq' and correct_option between 0 and 3)
    or (content_type <> 'mcq' and correct_option is null)
  ),
  unique (content_type, publish_date)
);

alter table public.daily_carousel_content
  add column if not exists image_paths text[] not null default '{}';
alter table public.daily_carousel_content
  add column if not exists pdf_paths text[] not null default '{}';

alter table public.daily_carousel_content enable row level security;

drop policy if exists daily_carousel_read_today on public.daily_carousel_content;
create policy daily_carousel_read_today
  on public.daily_carousel_content for select to anon, authenticated
  using (
    publish_date = (now() at time zone 'Asia/Kolkata')::date
    or public.is_daily_content_admin()
  );

drop policy if exists daily_carousel_admin_insert on public.daily_carousel_content;
create policy daily_carousel_admin_insert
  on public.daily_carousel_content for insert to authenticated
  with check (public.is_daily_content_admin());

drop policy if exists daily_carousel_admin_update on public.daily_carousel_content;
create policy daily_carousel_admin_update
  on public.daily_carousel_content for update to authenticated
  using (public.is_daily_content_admin())
  with check (public.is_daily_content_admin());

drop policy if exists daily_carousel_admin_delete on public.daily_carousel_content;
create policy daily_carousel_admin_delete
  on public.daily_carousel_content for delete to authenticated
  using (public.is_daily_content_admin());

grant select on public.daily_carousel_content to anon, authenticated;
grant insert, update, delete on public.daily_carousel_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'daily-carousel-assets',
  'daily-carousel-assets',
  true,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists daily_carousel_assets_admin_insert on storage.objects;
create policy daily_carousel_assets_admin_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'daily-carousel-assets'
    and public.is_daily_content_admin()
  );

drop policy if exists daily_carousel_assets_admin_update on storage.objects;
create policy daily_carousel_assets_admin_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'daily-carousel-assets'
    and public.is_daily_content_admin()
  )
  with check (
    bucket_id = 'daily-carousel-assets'
    and public.is_daily_content_admin()
  );

drop policy if exists daily_carousel_assets_admin_delete on storage.objects;
create policy daily_carousel_assets_admin_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'daily-carousel-assets'
    and public.is_daily_content_admin()
  );

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'daily_carousel_content'
  ) then
    alter publication supabase_realtime add table public.daily_carousel_content;
  end if;
end
$$;
