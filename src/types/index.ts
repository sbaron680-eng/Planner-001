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

// ── 운세 입력 ────────────────────────────────────────────────
export interface SajuInput {
  name: string;
  birth_date: string;    // YYYY-MM-DD
  birth_time?: string;   // HH:MM (선택)
  birth_jiji?: string;   // 자|축|인|묘... (12지지 시주, 선택)
  gender: 'male' | 'female';
  year: number;          // 운세를 볼 연도
}

export interface AstrologyInput {
  name: string;
  birth_date: string;
  zodiac?: string;       // 비어있으면 생년월일로 자동 감지
  year: number;
  focus?: string;        // 'love' | 'career' | 'money' | 'health' | '' (집중 분석 영역)
}

export interface CoupleInput {
  person1: SajuInput;
  person2: SajuInput;
  year: number;
}

// ── 오행 균형 ────────────────────────────────────────────────
export interface OhhaengBalance {
  목: number;  // 0–100 비율
  화: number;
  토: number;
  금: number;
  수: number;
}

// ── 운세 결과 ────────────────────────────────────────────────
export interface MonthlyFortune {
  month: number;
  fortune: string;
  score: number;         // 1–10
  keywords: string[];
}

export interface FortuneResult {
  id: string;
  type: FortuneType;

  // 공통 기본
  summary: string;
  yearly_fortune: string;
  monthly_fortunes: MonthlyFortune[];
  relationships?: string;
  career?: string;
  health?: string;
  wealth?: string;
  lucky_colors?: string[];
  lucky_numbers?: number[];

  // 사주 특화
  ganji_year?: string;            // 예: "을사년 (목화의 기운)"
  day_master?: string;            // 일간 예: "갑목(甲木) 일주"
  ohhaeng_balance?: OhhaengBalance; // 오행 비율
  lucky_directions?: string[];    // 행운의 방향
  caution_months?: number[];      // 조심할 달
  saju_advice?: string;           // 사주 특화 행동 지침
  shinsal?: string[];             // 신살 정보 (도화살, 역마살 등)

  // 점성술 특화
  zodiac?: string;                // 태양궁 별자리
  zodiac_element?: string;        // 원소 (불/흙/바람/물)
  ruling_planet?: string;         // 지배 행성
  planetary_highlights?: string;  // 주요 행성 트랜짓 설명
  retrograde_warning?: string;    // 역행 경고 기간

  // 커플 특화
  compatibility_score?: number;   // 궁합 점수 (1–100)
  compatibility_summary?: string; // 궁합 한 줄 요약
  couple_advice?: string;         // 커플 행동 지침
  couple_caution?: string;        // 커플 주의사항
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
  date: string;          // YYYY-MM-DD
  name: string;
  type: 'public' | 'substitute';
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

// ── 사용자 프로파일 (운세·PDF 개인 설정) ────────────────
export interface SajuProfile {
  name: string;
  birth_date: string;
  birth_jiji?: string;
  gender?: 'male' | 'female';
}

export interface AstroProfile {
  name: string;
  birth_date: string;
  zodiac?: string;
  focus?: string;
}

export interface PartnerProfile {
  name: string;
  birth_date: string;
  birth_jiji?: string;
  gender?: 'male' | 'female';
}

export interface UserProfile {
  // users 테이블 기본 정보
  birth_date?: string;
  birth_jiji?: string;
  gender?: 'male' | 'female';
  zodiac?: string;
  // 암호화된 프로파일 (복호화됨)
  saju_data?: SajuProfile;
  astro_data?: AstroProfile;
  partner_data?: PartnerProfile;
  preferred_template?: string;
  preferred_year?: number;
}

export interface FortuneHistoryItem {
  id: string;
  type: FortuneType;
  year: number;
  created_at: string;
  summary?: string;
}
