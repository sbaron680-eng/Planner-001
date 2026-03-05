export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  /** AES-256 필드 암호화 키 (최소 32자 랜덤 문자열) */
  FIELD_ENCRYPTION_KEY: string;
}
