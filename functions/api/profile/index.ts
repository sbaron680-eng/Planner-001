/**
 * api/profile/index.ts
 *
 * GET  /api/profile  — 현재 사용자 프로파일 조회
 * POST /api/profile  — 프로파일 생성 또는 업데이트
 *
 * 개인정보(사주, 점성술, 파트너 데이터)는 AES-GCM으로 암호화하여 DB 저장
 */

import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../../_types';
import { jsonResponse, getAuthUser } from '../../_middleware';
import { encryptField, decryptField } from '../../_crypto';

interface ProfilePayload {
  // 기본 정보 (users 테이블)
  birth_date?: string;    // YYYY-MM-DD
  birth_jiji?: string;    // 12지지 시주
  gender?: 'male' | 'female';
  zodiac?: string;
  // 운세 프로파일
  saju_name?: string;
  astro_name?: string;
  astro_focus?: string;
  partner_name?: string;
  partner_birth_date?: string;
  partner_birth_jiji?: string;
  partner_gender?: 'male' | 'female';
  // PDF 설정
  preferred_template?: string;
  preferred_year?: number;
}

interface DecryptedProfile {
  saju_data?: {
    name: string;
    birth_date: string;
    birth_jiji?: string;
    gender?: string;
  };
  astro_data?: {
    name: string;
    birth_date: string;
    zodiac?: string;
    focus?: string;
  };
  partner_data?: {
    name: string;
    birth_date: string;
    birth_jiji?: string;
    gender?: string;
  };
  preferred_template?: string;
  preferred_year?: number;
}

async function decryptProfile(
  row: Record<string, unknown>,
  key: string,
): Promise<DecryptedProfile> {
  const result: DecryptedProfile = {
    preferred_template: row.preferred_template as string | undefined,
    preferred_year: row.preferred_year as number | undefined,
  };
  if (row.saju_data) {
    try { result.saju_data = JSON.parse(await decryptField(row.saju_data as string, key)); } catch { /* ignore */ }
  }
  if (row.astro_data) {
    try { result.astro_data = JSON.parse(await decryptField(row.astro_data as string, key)); } catch { /* ignore */ }
  }
  if (row.partner_data) {
    try { result.partner_data = JSON.parse(await decryptField(row.partner_data as string, key)); } catch { /* ignore */ }
  }
  return result;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth) return jsonResponse({ ok: false, error: '로그인이 필요합니다.' }, 401);

  if (!env.FIELD_ENCRYPTION_KEY) {
    return jsonResponse({ ok: false, error: '암호화 키가 설정되지 않았습니다.' }, 500);
  }

  // 사용자 기본 정보
  const user = await env.DB.prepare(
    'SELECT birth_date, birth_jiji, gender, zodiac FROM users WHERE id = ?'
  ).bind(auth.userId).first() as Record<string, unknown> | null;

  // 운세 프로파일
  const profileRow = await env.DB.prepare(
    'SELECT saju_data, astro_data, partner_data, preferred_template, preferred_year FROM user_profiles WHERE user_id = ?'
  ).bind(auth.userId).first() as Record<string, unknown> | null;

  const profile = profileRow
    ? await decryptProfile(profileRow, env.FIELD_ENCRYPTION_KEY)
    : {};

  return jsonResponse({
    ok: true,
    data: {
      // 사용자 기본 정보 (암호화 없음 - users 테이블에 이미 저장)
      birth_date: user?.birth_date,
      birth_jiji: user?.birth_jiji,
      gender: user?.gender,
      zodiac: user?.zodiac,
      // 운세 프로파일 (복호화됨)
      ...profile,
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await getAuthUser(request, env);
  if (!auth) return jsonResponse({ ok: false, error: '로그인이 필요합니다.' }, 401);

  if (!env.FIELD_ENCRYPTION_KEY) {
    return jsonResponse({ ok: false, error: '암호화 키가 설정되지 않았습니다.' }, 500);
  }

  const body = await request.json() as ProfilePayload;
  const now = new Date().toISOString();

  // 입력값 검증
  if (body.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(body.birth_date)) {
    return jsonResponse({ ok: false, error: '생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, 400);
  }
  if (body.gender && !['male', 'female'].includes(body.gender)) {
    return jsonResponse({ ok: false, error: '성별 값이 올바르지 않습니다.' }, 400);
  }

  // users 테이블 기본 정보 업데이트
  const userUpdates: string[] = [];
  const userValues: unknown[] = [];
  if (body.birth_date !== undefined) { userUpdates.push('birth_date = ?'); userValues.push(body.birth_date); }
  if (body.birth_jiji !== undefined) { userUpdates.push('birth_jiji = ?'); userValues.push(body.birth_jiji); }
  if (body.gender !== undefined)     { userUpdates.push('gender = ?');     userValues.push(body.gender); }
  if (body.zodiac !== undefined)     { userUpdates.push('zodiac = ?');     userValues.push(body.zodiac); }
  if (userUpdates.length > 0) {
    userUpdates.push('updated_at = ?');
    userValues.push(now, auth.userId);
    await env.DB.prepare(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`)
      .bind(...userValues).run();
  }

  // 기존 프로파일 조회 (복호화)
  const existingRow = await env.DB.prepare(
    'SELECT saju_data, astro_data, partner_data, preferred_template, preferred_year FROM user_profiles WHERE user_id = ?'
  ).bind(auth.userId).first() as Record<string, unknown> | null;

  const existing = existingRow
    ? await decryptProfile(existingRow, env.FIELD_ENCRYPTION_KEY)
    : {};

  // 사주 데이터 병합 후 암호화
  const name = body.saju_name;
  const sajuObj = {
    name: name ?? existing.saju_data?.name ?? '',
    birth_date: body.birth_date ?? existing.saju_data?.birth_date ?? '',
    birth_jiji: body.birth_jiji ?? existing.saju_data?.birth_jiji,
    gender: body.gender ?? existing.saju_data?.gender,
  };
  const encSaju = sajuObj.name || sajuObj.birth_date
    ? await encryptField(JSON.stringify(sajuObj), env.FIELD_ENCRYPTION_KEY)
    : null;

  // 점성술 데이터 병합 후 암호화
  const astroObj = {
    name: body.astro_name ?? existing.astro_data?.name ?? sajuObj.name,
    birth_date: body.birth_date ?? existing.astro_data?.birth_date ?? '',
    zodiac: body.zodiac ?? existing.astro_data?.zodiac,
    focus: body.astro_focus ?? existing.astro_data?.focus,
  };
  const encAstro = astroObj.name || astroObj.birth_date
    ? await encryptField(JSON.stringify(astroObj), env.FIELD_ENCRYPTION_KEY)
    : null;

  // 파트너 데이터 암호화
  const partnerObj = {
    name: body.partner_name ?? existing.partner_data?.name ?? '',
    birth_date: body.partner_birth_date ?? existing.partner_data?.birth_date ?? '',
    birth_jiji: body.partner_birth_jiji ?? existing.partner_data?.birth_jiji,
    gender: body.partner_gender ?? existing.partner_data?.gender,
  };
  const encPartner = partnerObj.name || partnerObj.birth_date
    ? await encryptField(JSON.stringify(partnerObj), env.FIELD_ENCRYPTION_KEY)
    : null;

  const template = body.preferred_template ?? existing.preferred_template ?? 'minimal';
  const year = body.preferred_year ?? existing.preferred_year ?? new Date().getFullYear();

  // UPSERT
  await env.DB.prepare(`
    INSERT INTO user_profiles (id, user_id, saju_data, astro_data, partner_data, preferred_template, preferred_year, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      saju_data = excluded.saju_data,
      astro_data = excluded.astro_data,
      partner_data = excluded.partner_data,
      preferred_template = excluded.preferred_template,
      preferred_year = excluded.preferred_year,
      updated_at = excluded.updated_at
  `).bind(crypto.randomUUID(), auth.userId, encSaju, encAstro, encPartner, template, year, now).run();

  return jsonResponse({ ok: true, data: { message: '프로파일이 저장되었습니다.' } });
};
