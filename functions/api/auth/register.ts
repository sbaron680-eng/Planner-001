import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse } from '../../_middleware';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(password));
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
    const { email, password, name } = await request.json() as { email: string; password: string; name: string };

    if (!email || !password || !name) {
      return jsonResponse({ ok: false, error: '모든 항목을 입력해주세요.' }, 400);
    }
    if (password.length < 8) {
      return jsonResponse({ ok: false, error: '비밀번호는 8자 이상이어야 합니다.' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return jsonResponse({ ok: false, error: '이미 사용 중인 이메일입니다.' }, 409);
    }

    const id = crypto.randomUUID();
    const hashed = await hashPassword(password);
    const now = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name, role, plan, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
    ).bind(id, email, hashed, name, 'user', 'free', now, now).run();

    const user = { id, email, name, role: 'user', plan: 'free', created_at: now };
    const token = await createToken(id, 'user', env.JWT_SECRET);
    await env.SESSIONS.put(`session:${token}`, JSON.stringify({ userId: id, role: 'user' }), { expirationTtl: 60 * 60 * 24 * 30 });

    return jsonResponse({ ok: true, data: { user, token } }, 201);
  } catch {
    return jsonResponse({ ok: false, error: '회원가입 처리 중 오류가 발생했습니다.' }, 500);
  }
};
