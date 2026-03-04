// Cloudflare Cron Trigger — runs Oct 31 15:00 UTC = Nov 1 00:00 KST
// Updates app_settings planner_year to next year

import type { Env } from '../_types';

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const nextYear = (new Date().getFullYear() + 1).toString();
    await (env as unknown as { DB: D1Database }).DB.prepare(
      "INSERT INTO app_settings (key, value, updated_at) VALUES ('planner_year', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).bind(nextYear, new Date().toISOString()).run();
    console.log(`Planner year updated to ${nextYear}`);
  },
};
