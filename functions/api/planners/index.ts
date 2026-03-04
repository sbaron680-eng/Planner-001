import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse } from '../../_middleware';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const category = url.searchParams.get('category');

  let query = 'SELECT * FROM planners WHERE is_active = 1';
  const params: string[] = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  query += ' ORDER BY sort_order ASC';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ ok: true, data: results });
};
