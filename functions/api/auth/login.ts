import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse } from '../../_middleware';

// Simple password hashing via SubtleCrypto
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(userId: string, role: string, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: userId, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }));
  const data = `${header}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${data}.${sigB64}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email, password } = await request.json() as { email: string; password: string };
    if (!email || !password) {
      return jsonResponse({ ok: false, error: '이메일과 비밀번호를 입력해주세요.' }, 400);
    }

    const hashed = await hashPassword(password);
    const user = await env.DB.prepare(
      'SELECT id, email, name, role, plan, avatar_url, birth_date, birth_time, created_at FROM users WHERE email = ? AND password_hash = ? AND is_active = 1'
    ).bind(email, hashed).first();

    if (!user) {
      return jsonResponse({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
    }

    const token = await createToken(user.id as string, user.role as string, env.JWT_SECRET);
    await env.SESSIONS.put(`session:${token}`, JSON.stringify({ userId: user.id, role: user.role }), { expirationTtl: 60 * 60 * 24 * 30 });

    return jsonResponse({ ok: true, data: { user, token } });
  } catch {
    return jsonResponse({ ok: false, error: '로그인 처리 중 오류가 발생했습니다.' }, 500);
  }
};
