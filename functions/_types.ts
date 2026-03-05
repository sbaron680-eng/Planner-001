export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  /** AES-256 필드 암호화 키 (최소 32자 랜덤 문자열) */
  FIELD_ENCRYPTION_KEY: string;
  /** 배포된 사이트 URL (예: https://planner001.pages.dev) */
  APP_URL: string;
  /** Google OAuth 2.0 */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Kakao OAuth */
  KAKAO_CLIENT_ID: string;
  KAKAO_CLIENT_SECRET: string;
  /** Naver OAuth */
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}
