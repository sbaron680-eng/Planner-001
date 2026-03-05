import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse } from '../../_middleware';
import { verifyPassword, signJwt } from '../../_crypto';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({ ok: false, error: '이메일과 비밀번호를 입력해주세요.' }, 400);
    }

    const row = await env.DB.prepare(
      `SELECT id, email, name, role, plan, avatar_url, birth_date, birth_time, birth_jiji, gender, zodiac,
              password_hash, is_active, created_at
       FROM users WHERE email = ?`
    ).bind(email.toLowerCase()).first() as Record<string, unknown> | null;

    if (!row || !row.is_active) {
      // 타이밍 공격 방지: 항상 동일한 시간 소요
      await verifyPassword('dummy', 'pbkdf2$0000000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000');
      return jsonResponse({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }

    const stored = (row.password_hash as string) || (row.password as string) || '';
    const valid = await verifyPassword(password, stored);
    if (!valid) {
      return jsonResponse({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }

    // 비밀번호가 구형 SHA-256 해시라면 PBKDF2로 업그레이드
    if (stored && !stored.startsWith('pbkdf2$')) {
      const newHash = await signJwt({}, ''); // dummy - upgrades below
      const upgraded = await import('../../_crypto').then(m => m.hashPassword(password));
      await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(upgraded, row.id).run();
    }

    const token = await signJwt(
      { sub: row.id as string, role: row.role as string, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 },
      env.JWT_SECRET,
    );
    await env.SESSIONS.put(
      `session:${token}`,
      JSON.stringify({ userId: row.id, role: row.role }),
      { expirationTtl: 60 * 60 * 24 * 30 },
    );

    const user = {
      id: row.id, email: row.email, name: row.name, role: row.role, plan: row.plan,
      avatar_url: row.avatar_url, birth_date: row.birth_date, birth_time: row.birth_time,
      birth_jiji: row.birth_jiji, gender: row.gender, zodiac: row.zodiac,
      created_at: row.created_at,
    };
    return jsonResponse({ ok: true, data: { user, token } });
  } catch {
    return jsonResponse({ ok: false, error: '로그인 처리 중 오류가 발생했습니다.' }, 500);
  }
};
