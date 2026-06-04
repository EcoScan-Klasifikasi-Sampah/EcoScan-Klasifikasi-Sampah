create table if not exists public.scan_history (
  id uuid primary key,
  user_id uuid,
  filename text not null,
  predicted_class text not null,
  category text not null check (category in ('Organik', 'Anorganik', 'B3', 'Kertas', 'Residu')),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  handling_advice text not null,
  raw_predictions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.scan_history
  add column if not exists user_id uuid;

alter table public.scan_history
  drop constraint if exists scan_history_category_check;

alter table public.scan_history
  add constraint scan_history_category_check
  check (category in ('Organik', 'Anorganik', 'B3', 'Kertas', 'Residu'));

create index if not exists scan_history_created_at_idx
  on public.scan_history (created_at desc);

create index if not exists scan_history_user_id_idx
  on public.scan_history (user_id, created_at desc);

create table if not exists public.app_users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  avatar_url text not null default '',
  current_streak integer not null default 0 check (current_streak >= 0),
  last_activity_date date,
  streak_updated_at timestamptz not null default now(),
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.app_users
  add column if not exists avatar_url text not null default '';

alter table public.app_users
  add column if not exists current_streak integer not null default 0;

alter table public.app_users
  add column if not exists last_activity_date date;

alter table public.app_users
  add column if not exists streak_updated_at timestamptz not null default now();

alter table public.app_users
  drop constraint if exists app_users_current_streak_check;

alter table public.app_users
  add constraint app_users_current_streak_check
  check (current_streak >= 0);

alter table public.scan_history
  drop constraint if exists scan_history_user_id_fkey;

alter table public.scan_history
  add constraint scan_history_user_id_fkey
  foreign key (user_id) references public.app_users(id) on delete set null;

create index if not exists app_users_email_idx
  on public.app_users (email);

create index if not exists app_users_last_activity_date_idx
  on public.app_users (last_activity_date desc);

create table if not exists public."Tips" (
  id uuid primary key,
  title text not null,
  body text not null,
  category text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tips_created_at_idx
  on public."Tips" (created_at desc);

create table if not exists public.notifications (
  id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'info',
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.notifications
  add column if not exists is_read boolean not null default false;

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read)
  where is_read = false;

create or replace view public.notification_feed as
select
  id,
  user_id,
  title,
  body,
  body as message,
  type,
  data,
  is_read,
  is_read as read,
  created_at
from public.notifications;

create table if not exists public.weekly_challenges (
  id text primary key,
  title text not null,
  description text not null,
  current integer not null default 0 check (current >= 0),
  target integer not null default 1 check (target > 0),
  reward integer not null default 0 check (reward >= 0),
  ends_at text not null,
  created_at timestamptz not null default now()
);

create index if not exists weekly_challenges_created_at_idx
  on public.weekly_challenges (created_at desc);

create table if not exists public."UserChallenges" (
  id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  challenge_id text references public.weekly_challenges(id) on delete set null,
  current_count integer not null default 0 check (current_count >= 0),
  target_count integer not null default 1 check (target_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_challenges_user_updated_at_idx
  on public."UserChallenges" (user_id, updated_at desc);

create index if not exists user_challenges_user_challenge_idx
  on public."UserChallenges" (user_id, challenge_id);

create unique index if not exists user_challenges_user_challenge_unique_idx
  on public."UserChallenges" (user_id, challenge_id);

create table if not exists public.community_posts (
  id uuid primary key,
  user_id uuid references public.app_users(id) on delete set null,
  author text not null,
  badge text not null default 'Anggota',
  title text not null,
  body text not null,
  type text not null default 'post' check (type in ('post', 'tip')),
  tag text not null default '',
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

create index if not exists community_posts_type_idx
  on public.community_posts (type);

create index if not exists community_posts_search_idx
  on public.community_posts using gin (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(author, '') || ' ' || coalesce(tag, ''))
  );

create table if not exists public.community_comments (
  id uuid primary key,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  parent_id uuid references public.community_comments(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_id_idx
  on public.community_comments (post_id, created_at asc);

create table if not exists public.community_leaderboard (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  name text not null,
  scans integer not null default 0 check (scans >= 0),
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists community_leaderboard_points_idx
  on public.community_leaderboard (points desc);

create table if not exists public.eco_trivia (
  id text primary key,
  title text not null,
  text text not null,
  details text not null,
  thumbnail text,
  alt text,
  type text not null default 'organic',
  created_at timestamptz not null default now()
);

alter table public.eco_trivia
  add column if not exists thumbnail text;

alter table public.eco_trivia
  add column if not exists alt text;

create index if not exists eco_trivia_created_at_idx
  on public.eco_trivia (created_at desc);

insert into public.weekly_challenges (id, title, description, current, target, reward, ends_at)
values (
  'weekly-plastic-10',
  'Scan 10 sampah plastik',
  'Kumpulkan scan plastik bersih minggu ini dan bagikan tips pemilahanmu.',
  6,
  10,
  80,
  'Minggu ini'
)
on conflict (id) do nothing;

insert into public.community_posts (id, author, badge, title, body, type, tag, likes)
values
  (
    '6a58f05e-6815-46f4-89c3-70ad589db1f6',
    'Nadia',
    'Eco Mentor',
    'Tips memilah sampah dapur',
    'Pisahkan kulit buah dan sisa sayur sejak awal. Wadah kecil di dekat meja masak bikin kebiasaan ini lebih gampang.',
    'post',
    '',
    128
  ),
  (
    '65055bff-4a69-42c8-b163-cb59d1d2a900',
    'EcoScan',
    'Panduan',
    'Simpan limbah B3 terpisah',
    'Baterai, lampu, dan obat kedaluwarsa jangan dicampur dengan sampah rumah tangga.',
    'tip',
    'Keamanan',
    51
  )
on conflict (id) do nothing;

insert into public.community_comments (id, post_id, author, body)
values
  (
    'b3b8e585-dbdc-41d1-9477-4c37623682fb',
    '6a58f05e-6815-46f4-89c3-70ad589db1f6',
    'Sari',
    'Aku pakai wadah bekas es krim, ternyata praktis banget.'
  )
on conflict (id) do nothing;

insert into public.eco_trivia (id, title, text, details, type)
values
  (
    'trivia-plastic',
    'Fakta Daur Ulang',
    'Botol plastik PET sebaiknya dicuci, dikeringkan, lalu disetor ke bank sampah.',
    'Botol PET yang bersih lebih mudah diterima bank sampah karena tidak mencemari material lain.',
    'plastic'
  ),
  (
    'trivia-organic',
    'Sampah Organik',
    'Sisa sayur dan buah bisa diolah menjadi kompos untuk mengurangi sampah rumah.',
    'Sampah organik seperti kulit buah, sisa sayur, ampas kopi, dan daun kering bisa masuk komposter.',
    'organic'
  )
on conflict (id) do nothing;
