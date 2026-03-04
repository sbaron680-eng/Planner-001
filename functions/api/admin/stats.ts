import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { getAuthUser, jsonResponse } from '../../_middleware';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth || auth.role !== 'admin') {
    return jsonResponse({ ok: false, error: '관리자 권한이 필요합니다.' }, 403);
  }

  const [users, premium, purchases, revenue, pdfs, fortune] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE plan = 'premium'").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM purchases WHERE status = 'paid'").first<{ count: number }>(),
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM purchases WHERE status = 'paid'").first<{ total: number }>(),
    env.DB.prepare('SELECT COUNT(*) as count FROM generated_pdfs').first<{ count: number }>(),
    env.DB.prepare('SELECT COUNT(*) as count FROM fortune_records').first<{ count: number }>(),
  ]);

  return jsonResponse({
    ok: true,
    data: {
      total_users: users?.count ?? 0,
      premium_users: premium?.count ?? 0,
      total_purchases: purchases?.count ?? 0,
      total_revenue: revenue?.total ?? 0,
      pdfs_generated: pdfs?.count ?? 0,
      fortune_requests: fortune?.count ?? 0,
    },
  });
};
