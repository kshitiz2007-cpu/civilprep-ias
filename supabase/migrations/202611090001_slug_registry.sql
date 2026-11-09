-- CivilPrep IAS: canonical knowledge identity registry.
-- Apply only after the dedicated Supabase project and migration workflow are approved.
create extension if not exists pgcrypto;

create table if not exists public.slug_registry (
  canonical_id uuid primary key default gen_random_uuid(),
  slug_path text not null unique,
  entity_type text not null check (entity_type in (
    'syllabus_topic', 'editorial', 'lexicon_entry', 'pyq',
    'mains_prompt', 'test', 'vault_note', 'course', 'resource'
  )),
  parent_id uuid references public.slug_registry(canonical_id) on delete restrict,
  language text not null default 'bi' check (language in ('en', 'hi', 'bi')),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  gs_paper_code text,
  syllabus_weight numeric(5,2) check (syllabus_weight is null or syllabus_weight between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_registry_path_format check (
    slug_path = lower(slug_path)
    and slug_path !~ '(^/|/$|//|[^a-z0-9/_-])'
    and slug_path !~ '(^|/)-|-(/|$)'
  )
);

create index if not exists slug_registry_parent_idx on public.slug_registry(parent_id);
create index if not exists slug_registry_type_status_idx on public.slug_registry(entity_type, status);
create index if not exists slug_registry_metadata_gin_idx on public.slug_registry using gin(metadata);

create table if not exists public.slug_aliases (
  alias_path text primary key,
  canonical_id uuid not null references public.slug_registry(canonical_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint slug_alias_not_self check (alias_path <> '')
);

create index if not exists slug_aliases_canonical_idx on public.slug_aliases(canonical_id);

create or replace function public.prevent_slug_alias_collision()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.slug_registry where slug_path = new.alias_path) then
    raise exception 'Alias path already exists as a canonical slug: %', new.alias_path;
  end if;
  return new;
end;
$$;

drop trigger if exists slug_alias_collision_guard on public.slug_aliases;
create trigger slug_alias_collision_guard
before insert or update of alias_path on public.slug_aliases
for each row execute function public.prevent_slug_alias_collision();

alter table public.slug_registry enable row level security;
alter table public.slug_aliases enable row level security;

drop policy if exists "Published canonical slugs are readable" on public.slug_registry;
create policy "Published canonical slugs are readable"
on public.slug_registry for select
using (status = 'published');

drop policy if exists "Aliases for published slugs are readable" on public.slug_aliases;
create policy "Aliases for published slugs are readable"
on public.slug_aliases for select
using (exists (
  select 1 from public.slug_registry r
  where r.canonical_id = slug_aliases.canonical_id and r.status = 'published'
));

-- No client insert/update/delete policies are intentionally created here.


-- Prevent a new canonical path from taking over a historical alias.
create or replace function public.prevent_slug_canonical_alias_collision()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.slug_aliases where alias_path = new.slug_path) then
    raise exception 'Canonical path already exists as a historical alias: %', new.slug_path;
  end if;
  return new;
end;
$$;

drop trigger if exists slug_canonical_alias_guard on public.slug_registry;
create trigger slug_canonical_alias_guard
before insert or update of slug_path on public.slug_registry
for each row execute function public.prevent_slug_canonical_alias_collision();
