export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
}
