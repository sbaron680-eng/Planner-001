// ============================================================
// Planner 001 - 공통 타입 정의
// ============================================================

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'premium';
export type PlannerType = 'free' | 'premium';
export type PlannerCategory =
  | 'minimal' | 'colorful' | 'dark' | 'elegant'
  | 'nature' | 'classic' | 'premium' | 'saju'
  | 'astrology' | 'couple' | 'business';

export type FortuneType = 'saju' | 'astrology' | 'couple' | 'daily' | 'yearly';
export type PurchaseStatus = 'pending' | 'paid' | 'refunded';

// ── 사용자 ──────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  avatar_url?: string;
  birth_date?: string;   // YYYY-MM-DD
  birth_time?: string;   // HH:MM
  created_at: string;
}

// ── 플래너 ──────────────────────────────────────────────────
export interface Planner {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: PlannerCategory;
  type: PlannerType;
  price: number;          // KRW
  features: string[];
  template_key: string;
  thumbnail?: string;
  pages_count: number;
  is_fortune: boolean;
  is_active: boolean;
  sort_order: number;
}

// ── 운세 ──────────────────────────────────────────────────
export interface SajuInput {
  name: string;
  birth_date: string;   // YYYY-MM-DD
  birth_time?: string;  // HH:MM
  gender: 'male' | 'female';
  year: number;         // 운세를 볼 연도
}

export interface AstrologyInput {
  name: string;
  birth_date: string;
  zodiac?: string;
  year: number;
}

export interface CoupleInput {
  person1: SajuInput;
  person2: SajuInput;
  year: number;
}

export interface FortuneResult {
  id: string;
  type: FortuneType;
  summary: string;
  yearly_fortune: string;
  monthly_fortunes: MonthlyFortune[];
  relationships?: string;
  career?: string;
  health?: string;
  wealth?: string;
  lucky_colors?: string[];
  lucky_numbers?: number[];
}

export interface MonthlyFortune {
  month: number;
  fortune: string;
  score: number;        // 1-10
  keywords: string[];
}

// ── PDF 생성 ─────────────────────────────────────────────
export interface PDFGenerateRequest {
  planner_id: string;
  year: number;
  fortune?: FortuneResult;
  user_name?: string;
  template_key: string;
}

export interface PDFTemplate {
  key: string;
  name: string;
  colors: TemplateColors;
}

export interface TemplateColors {
  primary: [number, number, number];     // RGB 0-255
  secondary: [number, number, number];
  accent: [number, number, number];
  bg: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  border: [number, number, number];
}

// ── 공휴일 ──────────────────────────────────────────────
export interface Holiday {
  date: string;         // YYYY-MM-DD
  name: string;
  type: 'public' | 'substitute';  // 공휴일 | 대체공휴일
}

// ── 구매 ──────────────────────────────────────────────────
export interface Purchase {
  id: string;
  user_id: string;
  planner_id: string;
  planner?: Planner;
  amount: number;
  payment_method?: string;
  status: PurchaseStatus;
  created_at: string;
}

// ── API 응답 ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── 앱 설정 ─────────────────────────────────────────────
export interface AppSettings {
  planner_year: string;
  site_name: string;
  maintenance_mode: string;
}

// ── 관리자 통계 ──────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  premium_users: number;
  total_purchases: number;
  total_revenue: number;
  pdfs_generated: number;
  fortune_requests: number;
}
