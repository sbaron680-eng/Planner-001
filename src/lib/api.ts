import type {
  ApiResponse, User, Planner, Purchase,
  FortuneResult, SajuInput, AstrologyInput, CoupleInput,
  AdminStats,
} from '@/types';

const BASE = '/api';

async function req<T>(
  path: string,
  opts: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── 인증 ────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    req<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string }) =>
    req<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () =>
    req<User>('/auth/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  logout: () =>
    req('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// ── 플래너 ──────────────────────────────────────────────
export const plannerApi = {
  list: (type?: 'free' | 'premium') =>
    req<Planner[]>(`/planners${type ? `?type=${type}` : ''}`),

  get: (idOrSlug: string) =>
    req<Planner>(`/planners/${idOrSlug}`),
};

// ── 운세 ────────────────────────────────────────────────
export const fortuneApi = {
  saju: (input: SajuInput) =>
    req<FortuneResult>('/fortune/saju', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  astrology: (input: AstrologyInput) =>
    req<FortuneResult>('/fortune/astrology', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  couple: (input: CoupleInput) =>
    req<FortuneResult>('/fortune/couple', {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  daily: (zodiac: string) =>
    req<FortuneResult>(`/fortune/daily?zodiac=${zodiac}`),

  yearly: (birth_date: string, year: number) =>
    req<FortuneResult>(`/fortune/yearly?birth_date=${birth_date}&year=${year}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// ── 결제 ────────────────────────────────────────────────
export const paymentApi = {
  initiate: (planner_id: string) =>
    req<{ payment_url: string; order_id: string }>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ planner_id }),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  verify: (payment_key: string, order_id: string, amount: number) =>
    req<Purchase>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ payment_key, order_id, amount }),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  myPurchases: () =>
    req<Purchase[]>('/payments/my', {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// ── 관리자 ──────────────────────────────────────────────
export const adminApi = {
  stats: () =>
    req<AdminStats>('/admin/stats', {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  users: () =>
    req<User[]>('/admin/users', {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  createPlanner: (data: Partial<Planner>) =>
    req<Planner>('/admin/planners', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  updatePlanner: (id: string, data: Partial<Planner>) =>
    req<Planner>(`/admin/planners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// ── 토큰 헬퍼 ──────────────────────────────────────────
export function getToken(): string {
  return localStorage.getItem('planner_token') ?? '';
}

export function setToken(token: string): void {
  localStorage.setItem('planner_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('planner_token');
}

// ── 사용자 프로파일 ─────────────────────────────────────
export const profileApi = {
  get: () =>
    req<import('@/types').UserProfile>('/profile', {
      headers: { Authorization: `Bearer ${getToken()}` },
    }),

  update: (data: Partial<{
    birth_date: string;
    birth_jiji: string;
    gender: 'male' | 'female';
    zodiac: string;
    saju_name: string;
    astro_name: string;
    astro_focus: string;
    partner_name: string;
    partner_birth_date: string;
    partner_birth_jiji: string;
    partner_gender: 'male' | 'female';
    preferred_template: string;
    preferred_year: number;
  }>) =>
    req<{ message: string }>('/profile', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};

// ── 운세 기록 ───────────────────────────────────────────
export const fortuneHistoryApi = {
  list: (type?: string, page = 1) =>
    req<import('@/types').FortuneHistoryItem[]>(
      `/fortune/history${type ? `?type=${type}&page=${page}` : `?page=${page}`}`,
      { headers: { Authorization: `Bearer ${getToken()}` } },
    ),

  get: (id: string) =>
    req<import('@/types').FortuneResult>('/fortune/history', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
};
