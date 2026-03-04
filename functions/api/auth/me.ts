import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { getAuthUser, jsonResponse } from '../../_middleware';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth) return jsonResponse({ ok: false, error: '인증이 필요합니다.' }, 401);

  const user = await env.DB.prepare(
    'SELECT id, email, name, role, plan, avatar_url, birth_date, birth_time, created_at FROM users WHERE id = ?'
  ).bind(auth.userId).first();

  if (!user) return jsonResponse({ ok: false, error: '사용자를 찾을 수 없습니다.' }, 404);
  return jsonResponse({ ok: true, data: user });
};
