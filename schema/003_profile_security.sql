-- =============================================
-- Migration 003: User Profiles + Security
-- =============================================

-- 기존 users 테이블에 사주/점성술 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_jiji    TEXT;          -- 12지지 시주
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender        TEXT;          -- 'male' | 'female'
ALTER TABLE users ADD COLUMN IF NOT EXISTS zodiac        TEXT;          -- 별자리
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;          -- PBKDF2 해시 (신규)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT;          -- PBKDF2 salt
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active     INTEGER NOT NULL DEFAULT 1;

-- 개인화된 운세/플래너 설정 (암호화된 JSON 저장)
CREATE TABLE IF NOT EXISTS user_profiles (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  -- 사주 프로파일 (AES-GCM 암호화)
  saju_data     TEXT,            -- encrypted JSON: {name, birth_date, birth_jiji, gender}
  -- 점성술 프로파일 (AES-GCM 암호화)
  astro_data    TEXT,            -- encrypted JSON: {name, birth_date, zodiac, focus}
  -- 커플 파트너 정보 (AES-GCM 암호화)
  partner_data  TEXT,            -- encrypted JSON: {name, birth_date, birth_jiji, gender}
  -- PDF 설정
  preferred_template TEXT DEFAULT 'minimal',
  preferred_year     INTEGER,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- fortune_records 테이블에 암호화 플래그 추가
ALTER TABLE fortune_records ADD COLUMN IF NOT EXISTS is_encrypted INTEGER NOT NULL DEFAULT 0;
-- 중복 요청 방지용 캐시 키 (입력값 해시)
ALTER TABLE fortune_records ADD COLUMN IF NOT EXISTS cache_key    TEXT;

-- 보안 감사 로그
CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  ip_address  TEXT,
  action      TEXT NOT NULL,     -- 'login'|'register'|'fortune'|'profile_update'|'pdf_generate'
  status      TEXT NOT NULL,     -- 'success'|'failed'|'blocked'
  metadata    TEXT,              -- JSON (추가 정보)
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_user    ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_fortune_cache    ON fortune_records(cache_key);
CREATE INDEX IF NOT EXISTS idx_fortune_user_type ON fortune_records(user_id, type, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user       ON audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip         ON audit_log(ip_address, created_at);
