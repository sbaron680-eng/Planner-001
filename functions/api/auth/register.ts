import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse } from '../../_middleware';
import { hashPassword, signJwt } from '../../_crypto';

// 입력값 검증
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function validateName(name: string): boolean {
  return name.trim().length >= 1 && name.length <= 50;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as { email?: string; password?: string; name?: string };
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return jsonResponse({ ok: false, error: '모든 항목을 입력해주세요.' }, 400);
    }
    if (!validateEmail(email)) {
      return jsonResponse({ ok: false, error: '올바른 이메일 형식이 아닙니다.' }, 400);
    }
    if (!validateName(name)) {
      return jsonResponse({ ok: false, error: '이름은 1–50자여야 합니다.' }, 400);
    }
    if (password.length < 8 || password.length > 128) {
      return jsonResponse({ ok: false, error: '비밀번호는 8–128자여야 합니다.' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) {
      return jsonResponse({ ok: false, error: '이미 사용 중인 이메일입니다.' }, 409);
    }

    const id = crypto.randomUUID();
    // PBKDF2 해싱 (100k iterations)
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, plan, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', 'free', 1, ?, ?)`
    ).bind(id, email.toLowerCase(), passwordHash, name.trim(), now, now).run();

    const token = await signJwt(
      { sub: id, role: 'user', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 },
      env.JWT_SECRET,
    );
    await env.SESSIONS.put(
      `session:${token}`,
      JSON.stringify({ userId: id, role: 'user' }),
      { expirationTtl: 60 * 60 * 24 * 30 },
    );

    const user = { id, email: email.toLowerCase(), name: name.trim(), role: 'user', plan: 'free', created_at: now };
    return jsonResponse({ ok: true, data: { user, token } }, 201);
  } catch {
    return jsonResponse({ ok: false, error: '회원가입 처리 중 오류가 발생했습니다.' }, 500);
  }
};
