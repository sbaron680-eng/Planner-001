import type { Env } from './_types';

export interface RequestWithAuth extends Request {
  userId?: string;
  userRole?: string;
}

// Simple JWT decode (no crypto verify for edge — use HMAC in production)
function decodeJWT(token: string): { sub?: string; role?: string; exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export async function getAuthUser(
  request: Request,
  env: Env,
): Promise<{ userId: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  // Check KV session store
  const session = await env.SESSIONS.get(`session:${token}`);
  if (!session) {
    // Fallback: decode JWT
    const payload = decodeJWT(token);
    if (!payload?.sub || !payload.exp) return null;
    if (payload.exp < Date.now() / 1000) return null;
    return { userId: payload.sub, role: payload.role ?? 'user' };
  }
  try {
    const data = JSON.parse(session) as { userId: string; role: string };
    return data;
  } catch {
    return null;
  }
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  }
  return context.next();
};
