-- =============================================
-- Migration 004: OAuth 소셜 로그인
-- =============================================

-- OAuth 연동 계정 (사용자 1명이 여러 소셜 계정 연결 가능)
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,    -- 'google' | 'kakao' | 'naver'
  provider_id TEXT NOT NULL,    -- 소셜 서비스의 고유 사용자 ID
  email       TEXT,             -- 소셜 계정 이메일 (없을 수 있음)
  name        TEXT,             -- 소셜 계정 표시 이름
  avatar_url  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_id)
);

-- users 테이블에 소셜 로그인 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_oauth_user     ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider, provider_id);
