/**
 * api/fortune/history.ts
 *
 * GET /api/fortune/history?type=saju&limit=10&page=1
 * — 인증 사용자의 운세 기록 조회 (복호화하여 반환)
 */

import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse, getAuthUser } from '../../_middleware';
import { decryptField } from '../../_crypto';
import type { FortuneResult } from '../../../src/types';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth) return jsonResponse({ ok: false, error: '로그인이 필요합니다.' }, 401);

  const url    = new URL(request.url);
  const type   = url.searchParams.get('type');    // 'saju'|'astrology'|'couple'|'daily'|null
  const limit  = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 50);
  const offset = Math.max(parseInt(url.searchParams.get('page') ?? '1', 10) - 1, 0) * limit;

  const typeFilter = type ? 'AND type = ?' : '';
  const bindValues = type
    ? [auth.userId, type, limit, offset]
    : [auth.userId, limit, offset];

  const rows = await env.DB.prepare(`
    SELECT id, type, result, is_encrypted, year, created_at
    FROM fortune_records
    WHERE user_id = ? ${typeFilter}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...bindValues).all();

  const encKey = env.FIELD_ENCRYPTION_KEY;

  const records: Array<{ id: string; type: string; year: number; created_at: string; summary?: string; result?: FortuneResult }> = [];
  for (const row of (rows.results ?? []) as Array<Record<string, unknown>>) {
    let summary: string | undefined;
    try {
      const raw = row.is_encrypted && encKey
        ? await decryptField(row.result as string, encKey)
        : row.result as string;
      const parsed = JSON.parse(raw) as { summary?: string };
      summary = parsed.summary;
    } catch { /* ignore */ }

    records.push({
      id: row.id as string,
      type: row.type as string,
      year: row.year as number,
      created_at: row.created_at as string,
      summary,
    });
  }

  return jsonResponse({ ok: true, data: records });
};

// 특정 운세 결과 상세 조회
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth) return jsonResponse({ ok: false, error: '로그인이 필요합니다.' }, 401);

  const { id } = await request.json() as { id: string };
  if (!id) return jsonResponse({ ok: false, error: 'id가 필요합니다.' }, 400);

  const row = await env.DB.prepare(
    'SELECT id, type, result, is_encrypted, year, created_at FROM fortune_records WHERE id = ? AND user_id = ?'
  ).bind(id, auth.userId).first() as Record<string, unknown> | null;

  if (!row) return jsonResponse({ ok: false, error: '운세 기록을 찾을 수 없습니다.' }, 404);

  const encKey = env.FIELD_ENCRYPTION_KEY;
  try {
    const raw = row.is_encrypted && encKey
      ? await decryptField(row.result as string, encKey)
      : row.result as string;
    const parsed = JSON.parse(raw) as Omit<FortuneResult, 'id' | 'type'>;
    const result: FortuneResult = {
      id: row.id as string,
      type: row.type as FortuneResult['type'],
      monthly_fortunes: [],
      ...parsed,
    };
    return jsonResponse({ ok: true, data: result });
  } catch {
    return jsonResponse({ ok: false, error: '운세 결과를 불러오는 데 실패했습니다.' }, 500);
  }
};
