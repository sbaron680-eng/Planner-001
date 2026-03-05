/**
 * _middleware.ts — Cloudflare Pages 미들웨어
 *
 * 보안 강화:
 *  1. JWT HMAC-SHA256 서명 검증 (decode-only 취약점 수정)
 *  2. KV 기반 IP 레이트 리밋 (auth: 10req/min, fortune: 15req/min, default: 60req/min)
 *  3. 보안 HTTP 응답 헤더 (CSP, HSTS, X-Frame-Options 등)
 *  4. OPTIONS preflight 처리
 */

import type { Env } from './_types';
import { verifyJwt } from './_crypto';

// ── 보안 응답 헤더 ───────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com cdn.jsdelivr.net",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.anthropic.com",
    "frame-ancestors 'none'",
  ].join('; '),
};

// ── CORS 헤더 ────────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// ── 레이트 리밋 설정 ─────────────────────────────────────────
const RATE_LIMITS: Record<string, { max: number; windowSec: number }> = {
  '/api/auth/login':    { max: 10,  windowSec: 60 },
  '/api/auth/register': { max: 5,   windowSec: 60 },
  '/api/fortune':       { max: 15,  windowSec: 60 },
  default:              { max: 120, windowSec: 60 },
};

function getRateKey(pathname: string): string {
  for (const key of Object.keys(RATE_LIMITS).filter(k => k !== 'default')) {
    if (pathname.startsWith(key)) return key;
  }
  return 'default';
}

async function checkRateLimit(
  env: Env,
  ip: string,
  pathname: string,
): Promise<{ ok: boolean; retryAfter?: number }> {
  const limitKey = getRateKey(pathname);
  const { max, windowSec } = RATE_LIMITS[limitKey];
  const now = Math.floor(Date.now() / 1000);
  const kvKey = `rl:${limitKey.replace(/\//g, '_')}:${ip}:${Math.floor(now / windowSec)}`;

  try {
    const raw = await env.SESSIONS.get(kvKey);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= max) {
      return { ok: false, retryAfter: windowSec - (now % windowSec) };
    }
    await env.SESSIONS.put(kvKey, String(count + 1), { expirationTtl: windowSec * 2 });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// ── JSON 응답 헬퍼 ────────────────────────────────────────────
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

// ── 인증 유저 추출 (JWT HMAC 검증) ───────────────────────────
export async function getAuthUser(
  request: Request,
  env: Env,
): Promise<{ userId: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  // KV 세션 스토어 우선 확인
  const session = await env.SESSIONS.get(`session:${token}`);
  if (session) {
    try {
      return JSON.parse(session) as { userId: string; role: string };
    } catch {
      return null;
    }
  }

  // JWT HMAC 서명 검증 (decode-only 취약점 수정)
  if (!env.JWT_SECRET) return null;
  const payload = await verifyJwt(token, env.JWT_SECRET);
  if (!payload?.sub) return null;
  return { userId: payload.sub, role: payload.role ?? 'user' };
}

// ── 메인 미들웨어 핸들러 ─────────────────────────────────────
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } });
  }

  if (url.pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('CF-Connecting-IP') ??
      request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
      'unknown';

    const rateResult = await checkRateLimit(env, ip, url.pathname);
    if (!rateResult.ok) {
      return jsonResponse(
        { ok: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        429,
      );
    }
  }

  const response = await context.next();

  const newHeaders = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!newHeaders.has(k)) newHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
};
