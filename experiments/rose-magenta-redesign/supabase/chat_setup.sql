-- Run this in the Supabase SQL Editor for the project used by the app.
-- The app expects public.profiles(id, name, email, role) and role = 'admin'.

create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  image_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages add column if not exists id uuid default gen_random_uuid();
alter table public.messages add column if not exists sender_id uuid;
alter table public.messages add column if not exists receiver_id uuid;
alter table public.messages add column if not exists content text not null default '';
alter table public.messages add column if not exists image_url text;
alter table public.messages add column if not exists is_read boolean not null default false;
alter table public.messages add column if not exists created_at timestamptz not null default now();

update public.messages set id = gen_random_uuid() where id is null;
alter table public.messages alter column id set not null;

create unique index if not exists messages_id_chat_key on public.messages (id);
create index if not exists messages_sender_created_at_idx
  on public.messages (sender_id, created_at);
create index if not exists messages_receiver_created_at_idx
  on public.messages (receiver_id, created_at);

create or replace function public.is_chat_admin()
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

revoke all on function public.is_chat_admin() from public;
grant execute on function public.is_chat_admin() to authenticated;

alter table public.messages enable row level security;

drop policy if exists chat_messages_participant_read on public.messages;
create policy chat_messages_participant_read
  on public.messages for select to authenticated
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or public.is_chat_admin()
  );

drop policy if exists chat_messages_participant_send on public.messages;
create policy chat_messages_participant_send
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      public.is_chat_admin()
      or exists (
        select 1
        from public.profiles
        where id = receiver_id and role = 'admin'
      )
    )
  );

drop policy if exists chat_messages_recipient_read_receipt on public.messages;
create policy chat_messages_recipient_read_receipt
  on public.messages for update to authenticated
  using (receiver_id = auth.uid() or public.is_chat_admin())
  with check (
    (receiver_id = auth.uid() or public.is_chat_admin())
    and is_read = true
  );

revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;
grant update (is_read) on public.messages to authenticated;

-- Allow students to discover admin profiles and admins to view student names in the inbox.
-- This policy is additive; keep existing profile policies that support other app features.
drop policy if exists chat_profiles_visible_to_participants on public.profiles;
create policy chat_profiles_visible_to_participants
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or role = 'admin'
    or public.is_chat_admin()
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-images',
  'chat-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists chat_images_upload_own_folder on storage.objects;
create policy chat_images_upload_own_folder
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists chat_images_read_conversation on storage.objects;
create policy chat_images_read_conversation
  on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.messages
        where image_url = name
          and (sender_id = auth.uid() or receiver_id = auth.uid())
      )
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
