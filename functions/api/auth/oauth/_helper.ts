/**
 * OAuth 공통 헬퍼
 *
 * 1. CSRF state 생성/검증 (KV에 10분 TTL로 저장)
 * 2. OAuth 사용자 생성 또는 기존 계정 연결
 * 3. JWT + KV 세션 발급
 * 4. 프론트엔드 콜백 리다이렉트 빌더
 */

import type { Env } from '../../../_types';
import { signJwt } from '../../../_crypto';

// ── CSRF state 관리 ──────────────────────────────────────

export async function createOAuthState(
  env: Env,
  provider: string,
  redirectAfter = '/dashboard',
): Promise<string> {
  const state = `${provider}:${crypto.randomUUID()}`;
  await env.SESSIONS.put(
    `oauth_state:${state}`,
    JSON.stringify({ provider, redirectAfter }),
    { expirationTtl: 600 }, // 10분
  );
  return state;
}

export async function verifyOAuthState(
  env: Env,
  state: string,
): Promise<{ provider: string; redirectAfter: string } | null> {
  const raw = await env.SESSIONS.get(`oauth_state:${state}`);
  if (!raw) return null;
  await env.SESSIONS.delete(`oauth_state:${state}`); // 1회용
  try {
    return JSON.parse(raw) as { provider: string; redirectAfter: string };
  } catch {
    return null;
  }
}

// ── 사용자 생성 또는 기존 계정 연결 ─────────────────────

export interface OAuthUserInfo {
  provider: string;
  provider_id: string;
  email?: string;
  name: string;
  avatar_url?: string;
}

export async function createOrFindOAuthUser(
  env: Env,
  info: OAuthUserInfo,
): Promise<{ userId: string; role: string }> {
  const now = new Date().toISOString();

  // 1) 기존 OAuth 계정 조회
  const existing = await env.DB.prepare(
    'SELECT user_id FROM oauth_accounts WHERE provider = ? AND provider_id = ?'
  ).bind(info.provider, info.provider_id).first() as { user_id: string } | null;

  if (existing) {
    // 프로필 정보 갱신
    await env.DB.prepare(
      'UPDATE oauth_accounts SET email = ?, name = ?, avatar_url = ?, updated_at = ? WHERE provider = ? AND provider_id = ?'
    ).bind(info.email ?? null, info.name, info.avatar_url ?? null, now, info.provider, info.provider_id).run();

    const user = await env.DB.prepare(
      'SELECT id, role FROM users WHERE id = ? AND is_active = 1'
    ).bind(existing.user_id).first() as { id: string; role: string } | null;
    if (!user) throw new Error('사용자 계정이 비활성화되었습니다.');
    return { userId: user.id, role: user.role };
  }

  // 2) 같은 이메일의 기존 계정이 있으면 연결
  let userId: string;
  let role = 'user';

  if (info.email) {
    const byEmail = await env.DB.prepare(
      'SELECT id, role FROM users WHERE email = ? AND is_active = 1'
    ).bind(info.email.toLowerCase()).first() as { id: string; role: string } | null;

    if (byEmail) {
      userId = byEmail.id;
      role = byEmail.role;
      // avatar 업데이트
      await env.DB.prepare('UPDATE users SET avatar_url = ?, email_verified = 1, updated_at = ? WHERE id = ?')
        .bind(info.avatar_url ?? null, now, userId).run();
    } else {
      // 새 계정 생성 (비밀번호 없음 — OAuth 전용)
      userId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, name, role, plan, is_active, email_verified, avatar_url, created_at, updated_at)
         VALUES (?, ?, '', ?, 'user', 'free', 1, 1, ?, ?, ?)`
      ).bind(userId, info.email.toLowerCase(), info.name, info.avatar_url ?? null, now, now).run();
    }
  } else {
    // 이메일 없는 경우 무조건 새 계정 생성
    userId = crypto.randomUUID();
    const fakeMail = `${info.provider}_${info.provider_id}@oauth.planner001`;
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, plan, is_active, email_verified, avatar_url, created_at, updated_at)
       VALUES (?, ?, '', ?, 'user', 'free', 1, 0, ?, ?, ?)`
    ).bind(userId, fakeMail, info.name, info.avatar_url ?? null, now, now).run();
  }

  // OAuth 계정 연결 저장
  await env.DB.prepare(
    `INSERT INTO oauth_accounts (id, user_id, provider, provider_id, email, name, avatar_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(), userId, info.provider, info.provider_id,
    info.email ?? null, info.name, info.avatar_url ?? null, now, now,
  ).run();

  return { userId, role };
}

// ── JWT + 세션 발급 ──────────────────────────────────────

export async function issueSession(
  env: Env,
  userId: string,
  role: string,
): Promise<string> {
  const token = await signJwt(
    { sub: userId, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 },
    env.JWT_SECRET,
  );
  await env.SESSIONS.put(
    `session:${token}`,
    JSON.stringify({ userId, role }),
    { expirationTtl: 60 * 60 * 24 * 30 },
  );
  return token;
}

// ── 프론트엔드 리다이렉트 ────────────────────────────────

export function redirectToFrontend(
  appUrl: string,
  token: string,
  redirectAfter: string,
): Response {
  // 토큰을 URL fragment(#)로 전달 — 서버 로그에 남지 않음
  const dest = `${appUrl}/auth/oauth#token=${encodeURIComponent(token)}&next=${encodeURIComponent(redirectAfter)}`;
  return Response.redirect(dest, 302);
}

export function redirectErrorToFrontend(appUrl: string, error: string): Response {
  return Response.redirect(`${appUrl}/auth/oauth#error=${encodeURIComponent(error)}`, 302);
}
