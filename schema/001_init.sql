-- =============================================
-- Planner 001 - D1 Database Schema
-- =============================================

-- 사용자
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,          -- bcrypt hash
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  plan        TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'premium'
  avatar_url  TEXT,
  birth_date  TEXT,                   -- YYYY-MM-DD (사주용)
  birth_time  TEXT,                   -- HH:MM (사주용)
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 플래너 템플릿
CREATE TABLE IF NOT EXISTS planners (
  id           TEXT PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,  -- URL slug
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,         -- 'minimal'|'colorful'|'dark'|'elegant'|'nature'
  type         TEXT NOT NULL,         -- 'free' | 'premium'
  price        INTEGER NOT NULL DEFAULT 0,  -- KRW
  features     TEXT NOT NULL,         -- JSON array
  template_key TEXT NOT NULL,         -- template identifier
  thumbnail    TEXT,                  -- URL
  pages_count  INTEGER NOT NULL DEFAULT 60,
  is_fortune   INTEGER NOT NULL DEFAULT 0,   -- 1 = includes fortune/saju
  is_active    INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 구매 내역
CREATE TABLE IF NOT EXISTS purchases (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  planner_id      TEXT NOT NULL REFERENCES planners(id),
  amount          INTEGER NOT NULL,
  payment_key     TEXT,               -- PG사 결제키
  payment_method  TEXT,               -- 'card' | 'kakao' | 'naver'
  status          TEXT NOT NULL DEFAULT 'pending',  -- 'pending'|'paid'|'refunded'
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 운세 기록
CREATE TABLE IF NOT EXISTS fortune_records (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  type        TEXT NOT NULL,          -- 'saju'|'astrology'|'couple'|'daily'|'yearly'
  input_data  TEXT NOT NULL,          -- JSON
  result      TEXT,                   -- Claude API 응답
  year        INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 생성된 PDF 기록
CREATE TABLE IF NOT EXISTS generated_pdfs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  planner_id  TEXT NOT NULL REFERENCES planners(id),
  year        INTEGER NOT NULL,
  fortune_id  TEXT REFERENCES fortune_records(id),
  file_size   INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 연도 설정 (11월 1일 자동 변경)
CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 공지사항 / 마케팅
CREATE TABLE IF NOT EXISTS announcements (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_fortune_user ON fortune_records(user_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_user ON generated_pdfs(user_id);
CREATE INDEX IF NOT EXISTS idx_planners_type ON planners(type, is_active);
CREATE INDEX IF NOT EXISTS idx_planners_slug ON planners(slug);
