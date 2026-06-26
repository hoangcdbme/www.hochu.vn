-- =====================================================================
-- HỆ SINH THÁI SỐ DÒNG HỌ CHỬ — Phase 1 schema (Supabase / PostgreSQL)
-- Dán toàn bộ vào: Supabase Dashboard → SQL Editor → New query → Run.
-- An toàn chạy lại (idempotent).
-- =====================================================================

-- 1) Extensions ------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid + mã hoá
create extension if not exists vector;      -- pgvector cho RAG (Phase 4)
create extension if not exists pg_trgm;     -- tìm kiếm tên gần đúng

-- 2) Enums -----------------------------------------------------------
do $$ begin create type gender as enum ('male','female','other','unknown'); exception when duplicate_object then null; end $$;
do $$ begin create type approval_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type member_role as enum ('admin','editor','member'); exception when duplicate_object then null; end $$;
do $$ begin create type event_type as enum ('gio','hop','khac'); exception when duplicate_object then null; end $$;
do $$ begin create type marriage_status as enum ('married','divorced','widowed'); exception when duplicate_object then null; end $$;

-- 3) Tables ----------------------------------------------------------
create table if not exists clan (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  parent_clan_id uuid references clan(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists person (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender gender not null default 'unknown',
  dob date, dod date,
  dob_is_approx boolean not null default false,
  occupation text,
  bio text,
  photo_key text,                          -- key ảnh trong Cloudflare R2
  grave_lat double precision, grave_lng double precision,
  national_id_enc bytea,                   -- CCCD mã hoá (pgcrypto) — chỉ giải mã khi đủ quyền
  clan_id uuid references clan(id) on delete set null,
  father_id uuid references person(id) on delete set null,
  mother_id uuid references person(id) on delete set null,
  status approval_status not null default 'pending',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists marriage (
  id uuid primary key default gen_random_uuid(),
  person_a uuid not null references person(id) on delete cascade,
  person_b uuid not null references person(id) on delete cascade,
  start_date date, end_date date,
  status marriage_status not null default 'married',
  created_at timestamptz not null default now(),
  check (person_a <> person_b)
);

create table if not exists event (
  id uuid primary key default gen_random_uuid(),
  type event_type not null default 'gio',
  title text not null,
  start_at timestamptz,
  location text,
  clan_id uuid references clan(id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists event_attendee (
  event_id uuid references event(id) on delete cascade,
  person_id uuid references person(id) on delete cascade,
  primary key (event_id, person_id)
);

create table if not exists account_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  person_id uuid references person(id) on delete set null,
  display_name text,
  role member_role not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists change_request (
  id uuid primary key default gen_random_uuid(),
  entity text not null,                    -- 'person' | 'marriage' | 'event' ...
  entity_id uuid,
  action text not null default 'update',   -- 'create' | 'update' | 'delete'
  payload jsonb not null default '{}'::jsonb,
  submitted_by uuid references auth.users(id) on delete set null,
  status approval_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists document (
  id uuid primary key default gen_random_uuid(),
  source text, title text, body text,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists doc_chunk (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references document(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- 4) Indexes ---------------------------------------------------------
create index if not exists idx_person_father on person(father_id);
create index if not exists idx_person_mother on person(mother_id);
create index if not exists idx_person_clan   on person(clan_id);
create index if not exists idx_person_status on person(status);
create index if not exists idx_person_name   on person using gin (full_name gin_trgm_ops);
create index if not exists idx_clan_parent   on clan(parent_clan_id);
create index if not exists idx_event_clan    on event(clan_id);

-- 5) Helpers (SECURITY DEFINER → tránh đệ quy RLS) -------------------
create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','editor') from account_profile where id = auth.uid()), false)
$$;

create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_person_touch on person;
create trigger trg_person_touch before update on person
  for each row execute function public.touch_updated_at();

-- Tự tạo profile khi có user mới
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.account_profile (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Row Level Security ---------------------------------------------
alter table clan enable row level security;
alter table person enable row level security;
alter table marriage enable row level security;
alter table event enable row level security;
alter table event_attendee enable row level security;
alter table account_profile enable row level security;
alter table change_request enable row level security;
alter table document enable row level security;
alter table doc_chunk enable row level security;

-- person: approved = công khai; pending = tác giả + staff; sửa = staff hoặc bản nháp của mình
drop policy if exists person_read on person;
create policy person_read on person for select
  using (status = 'approved' or created_by = auth.uid() or public.is_staff());
drop policy if exists person_insert on person;
create policy person_insert on person for insert
  with check (auth.uid() is not null and created_by = auth.uid());
drop policy if exists person_update on person;
create policy person_update on person for update
  using (public.is_staff() or (created_by = auth.uid() and status = 'pending'));
drop policy if exists person_delete on person;
create policy person_delete on person for delete using (public.is_staff());

-- clan / marriage / event / event_attendee: đọc công khai, ghi = staff
do $$ declare t text;
begin
  foreach t in array array['clan','marriage','event','event_attendee'] loop
    execute format('drop policy if exists %1$s_read on %1$s', t);
    execute format('create policy %1$s_read on %1$s for select using (true)', t);
    execute format('drop policy if exists %1$s_write on %1$s', t);
    execute format('create policy %1$s_write on %1$s for all using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

-- account_profile: tự đọc/sửa; staff đọc hết
drop policy if exists ap_read on account_profile;
create policy ap_read on account_profile for select using (id = auth.uid() or public.is_staff());
drop policy if exists ap_update on account_profile;
create policy ap_update on account_profile for update using (id = auth.uid() or public.is_staff());

-- change_request: người gửi đọc của mình; staff đọc + duyệt; ai đăng nhập đều gửi được
drop policy if exists cr_read on change_request;
create policy cr_read on change_request for select using (submitted_by = auth.uid() or public.is_staff());
drop policy if exists cr_insert on change_request;
create policy cr_insert on change_request for insert with check (auth.uid() is not null and submitted_by = auth.uid());
drop policy if exists cr_update on change_request;
create policy cr_update on change_request for update using (public.is_staff());

-- document / doc_chunk: approved công khai, ghi = staff
drop policy if exists doc_read on document;
create policy doc_read on document for select using (status = 'approved' or public.is_staff());
drop policy if exists doc_write on document;
create policy doc_write on document for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists chunk_rw on doc_chunk;
create policy chunk_rw on doc_chunk for all using (public.is_staff()) with check (public.is_staff());

-- 7) View công khai (dùng cho cây gia phả) --------------------------
create or replace view person_public as
  select id, full_name, gender, dob, dod, occupation, bio, photo_key,
         clan_id, father_id, mother_id
  from person where status = 'approved';

-- 8) Dữ liệu MẪU (minh hoạ — thay bằng gia phả thật của dòng họ) ------
insert into clan (id, name, region) values
  ('00000000-0000-0000-0000-0000000000c1','Họ Chử Việt Nam','Hưng Yên')
on conflict (id) do nothing;

insert into person (id, full_name, gender, status, clan_id, occupation, bio) values
  ('00000000-0000-0000-0000-0000000000a1','Chử Đồng Tử','male','approved',
   '00000000-0000-0000-0000-0000000000c1','—','Thuỷ tổ huyền thoại (dữ liệu MẪU — thay bằng dữ liệu thật).')
on conflict (id) do nothing;

insert into person (id, full_name, gender, status, clan_id, father_id) values
  ('00000000-0000-0000-0000-0000000000a2','Chử Văn (đời 2) — mẫu','male','approved',
   '00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a3','Chử Thị (đời 2) — mẫu','female','approved',
   '00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a4','Chử Minh (đời 3) — mẫu','male','approved',
   '00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000a2')
on conflict (id) do nothing;

-- Xong. Kiểm tra:  select count(*) from person;  -- kỳ vọng >= 4
