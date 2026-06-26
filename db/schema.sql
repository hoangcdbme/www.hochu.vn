-- =====================================================================
-- HỆ SINH THÁI SỐ DÒNG HỌ CHỬ — Schema CMS v2 (Supabase / PostgreSQL)
-- Dán toàn bộ vào: Supabase → SQL Editor → New query → Run. Idempotent.
-- =====================================================================
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$ begin create type member_role as enum ('member','author','editor','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type article_status as enum ('draft','pending_review','published','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type event_type as enum ('gio','hop','khac'); exception when duplicate_object then null; end $$;

-- Hồ sơ người dùng (1-1 auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_key text,
  role member_role not null default 'member',
  created_at timestamptz not null default now()
);

-- Chuyên mục (phân cấp)
create table if not exists category (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  parent_id uuid references category(id) on delete set null,
  sort int not null default 0,
  cover_key text,
  created_at timestamptz not null default now()
);

-- Media trên R2 (DB chỉ lưu URL/metadata)
create table if not exists media_asset (
  id uuid primary key default gen_random_uuid(),
  r2_key text not null,
  url text,
  mime text, width int, height int, size_bytes bigint,
  created_at timestamptz not null default now()
);

-- Bài viết
create table if not exists article (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text not null default '',
  cover_url text,
  category_id uuid references category(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status article_status not null default 'draft',
  seo_title text, seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comment (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references article(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists event (
  id uuid primary key default gen_random_uuid(),
  type event_type not null default 'gio',
  title text not null,
  start_at timestamptz,
  location text,
  description text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_article_status on article(status);
create index if not exists idx_article_published on article(published_at desc);
create index if not exists idx_article_category on article(category_id);
create index if not exists idx_article_title on article using gin (title gin_trgm_ops);
create index if not exists idx_category_parent on category(parent_id);

-- Helpers
create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('editor','admin') from profiles where id = auth.uid()), false)
$$;
create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_article_touch on article;
create trigger trg_article_touch before update on article for each row execute function public.touch_updated_at();
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email)) on conflict (id) do nothing;
  return new; end $$;
drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table category enable row level security;
alter table media_asset enable row level security;
alter table article enable row level security;
alter table comment enable row level security;
alter table event enable row level security;

-- category / event / media: đọc công khai, ghi = staff
do $$ declare t text; begin
  foreach t in array array['category','event','media_asset'] loop
    execute format('drop policy if exists %1$s_read on %1$s', t);
    execute format('create policy %1$s_read on %1$s for select using (true)', t);
    execute format('drop policy if exists %1$s_write on %1$s', t);
    execute format('create policy %1$s_write on %1$s for all using (public.is_staff()) with check (public.is_staff())', t);
  end loop; end $$;

-- article: published = công khai; nháp = tác giả + staff
drop policy if exists article_read on article;
create policy article_read on article for select using (status = 'published' or author_id = auth.uid() or public.is_staff());
drop policy if exists article_insert on article;
create policy article_insert on article for insert with check (auth.uid() is not null and author_id = auth.uid());
drop policy if exists article_update on article;
create policy article_update on article for update using (public.is_staff() or (author_id = auth.uid() and status in ('draft','pending_review')));
drop policy if exists article_delete on article;
create policy article_delete on article for delete using (public.is_staff());

-- profiles: tự đọc/sửa; staff đọc hết
drop policy if exists prof_read on profiles;
create policy prof_read on profiles for select using (id = auth.uid() or public.is_staff());
drop policy if exists prof_update on profiles;
create policy prof_update on profiles for update using (id = auth.uid() or public.is_staff());

-- comment: đọc bình luận đã duyệt; member tự thêm; sửa/xoá của mình; staff toàn quyền
drop policy if exists cmt_read on comment;
create policy cmt_read on comment for select using (is_approved or author_id = auth.uid() or public.is_staff());
drop policy if exists cmt_insert on comment;
create policy cmt_insert on comment for insert with check (auth.uid() is not null and author_id = auth.uid());
drop policy if exists cmt_mod on comment;
create policy cmt_mod on comment for update using (public.is_staff() or author_id = auth.uid());

-- =================== DỮ LIỆU MẪU (thay bằng nội dung thật) ===================
insert into category (id, slug, name, description, sort) values
  ('00000000-0000-0000-0000-0000000000d1','gioi-thieu','Giới thiệu dòng họ','Nguồn gốc, lịch sử, truyền thống dòng họ Chử Việt Nam',1),
  ('00000000-0000-0000-0000-0000000000d2','tin-tuc','Tin tức','Tin tức, hoạt động, sự kiện của dòng họ',2),
  ('00000000-0000-0000-0000-0000000000d3','nhan-vat','Nhân vật & dòng tộc','Chân dung, tiểu sử các bậc tiền nhân và con cháu họ Chử',3)
on conflict (slug) do nothing;

insert into article (slug, title, excerpt, status, category_id, published_at, seo_title, seo_description, body_md) values
('gioi-thieu-dong-ho-chu-viet-nam',
 'Giới thiệu dòng họ Chử Việt Nam',
 'Dòng họ Chử là một trong những dòng họ lâu đời của Việt Nam, gắn với huyền thoại Chử Đồng Tử — một trong Tứ bất tử.',
 'published','00000000-0000-0000-0000-0000000000d1', now(),
 'Giới thiệu dòng họ Chử Việt Nam — nguồn gốc & truyền thống',
 'Tìm hiểu nguồn gốc, lịch sử và truyền thống của dòng họ Chử Việt Nam, gắn với huyền thoại Chử Đồng Tử.',
 E'## Nguồn gốc\n\nDòng họ **Chử** là một dòng họ lâu đời của người Việt. Trong tâm thức dân gian, dòng họ gắn liền với **Chử Đồng Tử** — một trong **Tứ bất tử** của tín ngưỡng Việt Nam, biểu tượng của tình yêu, lòng hiếu thảo và tinh thần khai phá.\n\n## Truyền thống\n\nQua nhiều thế hệ, con cháu họ Chử gìn giữ truyền thống **hiếu học, đoàn kết và hướng về cội nguồn**. Hệ sinh thái số này được lập nên để:\n\n- Kết nối các chi họ Chử trên khắp Việt Nam và hải ngoại.\n- Lưu giữ phả hệ, tư liệu, hình ảnh của dòng tộc.\n- Lan tỏa tin tức, sự kiện và các giá trị văn hóa dòng họ.\n\n> *Đây là nội dung mẫu — Hội đồng gia tộc sẽ biên tập và bổ sung tư liệu chính thức.*'),
('ra-mat-he-sinh-thai-so-dong-ho-chu',
 'Ra mắt Hệ sinh thái số Dòng họ Chử',
 'Nền tảng nội dung và kết nối trực tuyến của dòng họ Chử chính thức đi vào hoạt động.',
 'published','00000000-0000-0000-0000-0000000000d2', now(),
 'Ra mắt Hệ sinh thái số Dòng họ Chử Việt Nam',
 'Nền tảng số kết nối dòng họ Chử: tin tức, chuyên mục, phả hệ — truy cập trên web và điện thoại.',
 E'## Một bước ngoặt số hóa\n\nHệ sinh thái số Dòng họ Chử chính thức ra mắt, mang đến:\n\n1. **Trang tin & chuyên mục** chuyên nghiệp về dòng họ.\n2. **Phả hệ trực tuyến** (sắp có) kết nối các đời, các chi.\n3. **Ứng dụng di động** để theo dõi tin tức và sự kiện mọi lúc mọi nơi.\n\nHãy cùng chung tay đóng góp tư liệu để dòng họ ngày càng gắn kết.')
on conflict (slug) do nothing;
