import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_types';
import { jsonResponse, getAuthUser } from '../_middleware';
import { encryptField, decryptField, hashCacheKey } from '../_crypto';
import type { FortuneResult, MonthlyFortune, SajuInput, AstrologyInput, CoupleInput } from '../../src/types';

// ── 연도 간지 계산 ────────────────────────────────────────
function getYearGanji(year: number): string {
  const stems   = ['갑','을','병','정','무','기','경','신','임','계'];
  const branches= ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const stemEl  = ['목','목','화','화','토','토','금','금','수','수'];
  const branchEl= ['수','토','목','목','토','화','화','토','금','금','토','수'];
  const animals = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  const si = ((year - 4) % 10 + 10) % 10;
  const bi = ((year - 4) % 12 + 12) % 12;
  return `${stems[si]}${branches[bi]}년 (${stemEl[si]}${branchEl[bi]}의 기운, ${animals[bi]}의 해)`;
}

// ── 사주 프롬프트 ─────────────────────────────────────────
function buildSajuPrompt(input: SajuInput): string {
  const yearDesc = getYearGanji(input.year);
  const jijiDesc = input.birth_jiji
    ? `시주: ${input.birth_jiji}시`
    : input.birth_time
      ? `태어난 시각: ${input.birth_time}`
      : '태어난 시간: 미상';

  return `당신은 30년 경력의 한국 사주명리학 전문가입니다.
다음 사주 정보를 바탕으로 ${input.year}년 운세를 심층 분석해주세요.

【 사주 기본 정보 】
• 이름: ${input.name}
• 생년월일: ${input.birth_date}
• ${jijiDesc}
• 성별: ${input.gender === 'male' ? '남성' : '여성'}
• 분석 연도: ${input.year}년 (${yearDesc})

【 분석 가이드라인 】
1. 생년월일로 연주·월주·일주를 계산하고, 일간(日干)을 중심으로 분석하세요.
2. 오행(목·화·토·금·수) 균형 상태와 용신(用神)을 파악하세요.
3. ${input.year}년 세운(歲運)의 천간·지지가 사주와 어떻게 상호작용하는지 분석하세요.
4. 신살(도화살·역마살·화개살 등) 중 해당하는 항목을 언급하세요.
5. 한국어로 따뜻하고 희망적인 톤으로 작성하되, 조심해야 할 부분도 솔직하게 언급하세요.

다음 JSON 형식으로 정확히 응답하세요 (JSON 외 다른 텍스트 금지):
{
  "summary": "종합 운세 요약 — 200자 내외",
  "yearly_fortune": "연간 운세 상세 — 300자 내외",
  "relationships": "인간관계·사랑운 — 150자 내외",
  "career": "직업·사업·학업운 — 150자 내외",
  "wealth": "금전·재물·투자운 — 150자 내외",
  "health": "건강·체력·정신건강 — 100자 내외",
  "lucky_colors": ["행운색1", "행운색2", "행운색3"],
  "lucky_numbers": [숫자1, 숫자2, 숫자3],
  "lucky_directions": ["행운의방향1", "행운의방향2"],
  "ganji_year": "${yearDesc}",
  "day_master": "일간 설명 — 예: 갑목(甲木) 일주, 양기(陽氣)가 강한 성격",
  "ohhaeng_balance": {"목": 오행비율0-100, "화": 0-100, "토": 0-100, "금": 0-100, "수": 0-100},
  "shinsal": ["해당 신살명 (설명)", "없으면 빈 배열"],
  "caution_months": [조심할_월_숫자_배열],
  "saju_advice": "이 사주에 맞는 구체적 행동 지침 — 150자 내외",
  "monthly_fortunes": [
    {"month": 1, "fortune": "1월 운세 80자 내외", "score": 1에서10사이정수, "keywords": ["키워드1", "키워드2"]},
    {"month": 2, "fortune": "2월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 3, "fortune": "3월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 4, "fortune": "4월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 5, "fortune": "5월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 6, "fortune": "6월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 7, "fortune": "7월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 8, "fortune": "8월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 9, "fortune": "9월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 10, "fortune": "10월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 11, "fortune": "11월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 12, "fortune": "12월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]}
  ]
}`;
}

// ── 점성술 프롬프트 ───────────────────────────────────────
function buildAstrologyPrompt(input: AstrologyInput): string {
  const yearDesc = getYearGanji(input.year);
  const zodiac = input.zodiac || '생년월일에서 자동 감지';
  const focusHint = input.focus ? `\n• 특별히 "${input.focus}" 분야를 더 상세히 분석해주세요.` : '';

  const astronomyNote = input.year === 2025
    ? '2025년 주요 행성 이동: 토성 물고기자리→양자리 전환, 해왕성 물고기자리 마지막 해, 천왕성 황소자리, 목성 쌍둥이자리→게자리 전환. 주요 역행: 수성 역행 3회(1·5·9월), 금성 역행(3월)'
    : input.year === 2026
      ? '2026년 주요 행성: 토성 양자리, 해왕성 양자리 진입, 목성 게자리. 수성 역행 3회, 화성 역행(11월)'
      : `${input.year}년 행성 트랜짓을 분석에 반영하세요.`;

  return `당신은 20년 경력의 서양 점성술 전문가입니다.
다음 정보를 바탕으로 ${input.year}년 별자리 운세를 심층 분석해주세요.

【 기본 정보 】
• 이름: ${input.name}
• 생년월일: ${input.birth_date}
• 태양궁 별자리: ${zodiac}
• 분석 연도: ${input.year}년${focusHint}

【 천문학적 배경 (${input.year}년) 】
${astronomyNote}

【 분석 가이드라인 】
1. 태양궁 별자리의 고유 특성과 지배 행성 영향을 중심으로 분석하세요.
2. ${input.year}년 주요 행성 트랜짓이 해당 별자리에 미치는 구체적 영향을 서술하세요.
3. 수성·금성·화성 역행 기간의 주의사항을 월별 운세에 반영하세요.
4. 한국어로 따뜻하고 희망적인 톤으로 작성하세요.

다음 JSON 형식으로 정확히 응답하세요 (JSON 외 다른 텍스트 금지):
{
  "summary": "종합 운세 요약 — 200자 내외",
  "yearly_fortune": "연간 운세 상세 — 300자 내외",
  "relationships": "사랑·인간관계운 — 150자 내외",
  "career": "직업·창의·성장운 — 150자 내외",
  "wealth": "금전·물질·기회운 — 150자 내외",
  "health": "건강·에너지·정신 — 100자 내외",
  "lucky_colors": ["행운색1", "행운색2"],
  "lucky_numbers": [숫자1, 숫자2, 숫자3],
  "zodiac": "${zodiac === '생년월일에서 자동 감지' ? '(생년월일로 감지된 별자리명)' : zodiac}",
  "zodiac_element": "이 별자리의 원소 (불/흙/바람/물)",
  "ruling_planet": "지배 행성명",
  "planetary_highlights": "${input.year}년 주요 행성 이동이 이 별자리에 미치는 핵심 영향 — 150자",
  "retrograde_warning": "역행 기간 주의사항 — 100자 내외, 없으면 null",
  "monthly_fortunes": [
    {"month": 1, "fortune": "1월 운세 80자", "score": 1에서10사이정수, "keywords": ["키워드1", "키워드2"]},
    {"month": 2, "fortune": "2월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 3, "fortune": "3월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 4, "fortune": "4월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 5, "fortune": "5월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 6, "fortune": "6월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 7, "fortune": "7월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 8, "fortune": "8월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 9, "fortune": "9월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 10, "fortune": "10월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 11, "fortune": "11월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 12, "fortune": "12월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]}
  ]
}`;
}

// ── 커플 궁합 프롬프트 ───────────────────────────────────
function buildCouplePrompt(input: CoupleInput): string {
  const p1 = input.person1;
  const p2 = input.person2;
  const yearDesc = getYearGanji(input.year);

  return `당신은 30년 경력의 한국 사주명리학 전문가이자 궁합 상담가입니다.
두 사람의 사주를 분석하여 ${input.year}년 커플 궁합을 심층 분석해주세요.

【 첫 번째 사람 】
• 이름: ${p1.name}
• 생년월일: ${p1.birth_date}
• 성별: ${p1.gender === 'male' ? '남성' : '여성'}
${p1.birth_jiji ? `• 시주: ${p1.birth_jiji}시` : ''}

【 두 번째 사람 】
• 이름: ${p2.name}
• 생년월일: ${p2.birth_date}
• 성별: ${p2.gender === 'male' ? '남성' : '여성'}
${p2.birth_jiji ? `• 시주: ${p2.birth_jiji}시` : ''}

• 분석 연도: ${input.year}년 (${yearDesc})

【 분석 가이드라인 】
1. 두 사람의 일간(日干)을 비교하여 오행 상생·상극 관계를 분석하세요.
2. 납음오행, 삼합·육합·충·형·파·해 관계를 파악하세요.
3. ${input.year}년 두 사람이 함께 어떤 시간을 보내게 될지 예측하세요.
4. 궁합 점수는 100점 만점으로, 60점 이상은 좋은 궁합입니다.
5. 장점과 단점을 균형 있게 서술하고, 관계 발전을 위한 실질적 조언을 제공하세요.

다음 JSON 형식으로 정확히 응답하세요 (JSON 외 다른 텍스트 금지):
{
  "summary": "두 사람의 종합 궁합 요약 — 200자 내외",
  "yearly_fortune": "${input.year}년 두 사람이 함께하는 시간의 흐름 — 300자",
  "compatibility_score": 궁합점수_0에서100,
  "compatibility_summary": "궁합 한 줄 평가 — 30자 내외",
  "relationships": "감정적 교감·소통 방식 궁합 — 150자",
  "career": "함께하는 목표·경제활동 궁합 — 100자",
  "wealth": "금전·경제적 가치관 궁합 — 100자",
  "health": "생활리듬·체력 조화 — 80자",
  "couple_advice": "관계를 더 좋게 만들기 위한 구체적 조언 — 150자",
  "couple_caution": "갈등이 생길 수 있는 상황과 해결 방법 — 100자",
  "lucky_colors": ["두 사람에게 좋은 색1", "색2"],
  "lucky_numbers": [숫자1, 숫자2],
  "monthly_fortunes": [
    {"month": 1, "fortune": "1월 두 사람의 운세 80자", "score": 1에서10, "keywords": ["키워드1", "키워드2"]},
    {"month": 2, "fortune": "2월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 3, "fortune": "3월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 4, "fortune": "4월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 5, "fortune": "5월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 6, "fortune": "6월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 7, "fortune": "7월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 8, "fortune": "8월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 9, "fortune": "9월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 10, "fortune": "10월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 11, "fortune": "11월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]},
    {"month": 12, "fortune": "12월 운세", "score": 숫자, "keywords": ["키워드1", "키워드2"]}
  ]
}`;
}

// ── 오늘의 운세 프롬프트 ─────────────────────────────────
function buildDailyPrompt(zodiac: string, today: string): string {
  return `당신은 점성술 전문가입니다. ${today} ${zodiac}의 오늘 하루 운세를 분석해주세요.

짧고 명확하게, 실질적인 조언 중심으로 작성하세요. 긍정적이지만 솔직하게.

다음 JSON 형식으로 정확히 응답하세요:
{
  "summary": "오늘의 종합 운세 — 100자 내외",
  "yearly_fortune": "오늘 특히 주의할 점과 기회 — 80자 내외",
  "relationships": "오늘의 인간관계·감정 운세 — 60자",
  "career": "오늘의 업무·집중력 운세 — 60자",
  "wealth": "오늘의 금전·소비 운세 — 60자",
  "health": "오늘의 건강·에너지 — 50자",
  "lucky_colors": ["오늘의 행운색"],
  "lucky_numbers": [행운숫자1, 행운숫자2],
  "zodiac": "${zodiac}",
  "monthly_fortunes": []
}`;
}

// ── Claude API 호출 ───────────────────────────────────────
async function callClaude(apiKey: string, prompt: string, maxTokens = 2800): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  return data.content[0]?.type === 'text' ? data.content[0].text : '';
}

function parseFortuneJson(text: string): Omit<FortuneResult, 'id' | 'type'> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned) as Omit<FortuneResult, 'id' | 'type'>;
}

// ── 캐시된 운세 조회 (24시간 이내, 사주/점성술) ─────────
async function getCachedFortune(
  db: D1Database,
  cacheKey: string,
  encKey: string | undefined,
): Promise<FortuneResult | null> {
  // daily 운세는 캐시 24시간
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const row = await db.prepare(
    `SELECT id, type, result, is_encrypted FROM fortune_records
     WHERE cache_key = ? AND created_at > ? ORDER BY created_at DESC LIMIT 1`
  ).bind(cacheKey, cutoff).first() as Record<string, unknown> | null;

  if (!row?.result) return null;
  try {
    const raw = row.is_encrypted && encKey
      ? await decryptField(row.result as string, encKey)
      : row.result as string;
    const parsed = JSON.parse(raw) as Omit<FortuneResult, 'id' | 'type'>;
    return { id: row.id as string, type: row.type as FortuneResult['type'], monthly_fortunes: [], ...parsed };
  } catch {
    return null;
  }
}

// ── 메인 핸들러 ───────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ ok: false, error: 'API 키가 설정되지 않았습니다.' }, 500);
    }

    const body = await request.json() as {
      type: 'saju' | 'astrology' | 'couple' | 'daily';
      input: Record<string, unknown>;
    };

    // 인증 사용자 확인 (선택적)
    const auth = await getAuthUser(request, env);

    let prompt: string;
    let fortuneType: FortuneResult['type'];
    let maxTokens = 2800;

    // 입력 데이터 기반 캐시 키 (사주/점성술/커플은 동일 입력이면 캐시 재사용)
    const cacheInput = { type: body.type, ...body.input };
    const cacheKey = await hashCacheKey(cacheInput);

    // 캐시 확인 (daily는 제외)
    if (body.type !== 'daily') {
      const cached = await getCachedFortune(env.DB, cacheKey, env.FIELD_ENCRYPTION_KEY);
      if (cached) {
        return jsonResponse({ ok: true, data: cached, cached: true });
      }
    }

    switch (body.type) {
      case 'saju':
        prompt = buildSajuPrompt(body.input as SajuInput);
        fortuneType = 'saju';
        break;
      case 'astrology':
        prompt = buildAstrologyPrompt(body.input as AstrologyInput);
        fortuneType = 'astrology';
        break;
      case 'couple':
        prompt = buildCouplePrompt(body.input as CoupleInput);
        fortuneType = 'couple';
        maxTokens = 3200;
        break;
      case 'daily': {
        const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
        prompt = buildDailyPrompt((body.input as { zodiac: string }).zodiac, today);
        fortuneType = 'daily';
        maxTokens = 800;
        break;
      }
      default:
        return jsonResponse({ ok: false, error: '지원하지 않는 운세 유형입니다.' }, 400);
    }

    const text = await callClaude(env.ANTHROPIC_API_KEY, prompt, maxTokens);
    const parsed = parseFortuneJson(text);

    const id = crypto.randomUUID();
    const result: FortuneResult = {
      id,
      type: fortuneType,
      monthly_fortunes: [],
      ...parsed,
    };

    // DB 저장 (비동기 — 응답에 영향 없음)
    void (async () => {
      try {
        const now = new Date().toISOString();
        // 입력 데이터 & 결과 암호화 (FIELD_ENCRYPTION_KEY 있을 때)
        const encKey = env.FIELD_ENCRYPTION_KEY;
        const inputStr = JSON.stringify(body.input);
        const resultStr = JSON.stringify(parsed);

        let storedInput = inputStr;
        let storedResult = resultStr;
        let isEncrypted = 0;

        if (encKey) {
          storedInput  = await encryptField(inputStr, encKey);
          storedResult = await encryptField(resultStr, encKey);
          isEncrypted  = 1;
        }

        const yearVal = (body.input as { year?: number }).year ?? new Date().getFullYear();

        await env.DB.prepare(`
          INSERT INTO fortune_records (id, user_id, type, input_data, result, year, cache_key, is_encrypted, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          auth?.userId ?? null,
          fortuneType,
          storedInput,
          storedResult,
          yearVal,
          cacheKey,
          isEncrypted,
          now,
        ).run();
      } catch (dbErr) {
        console.error('Fortune DB save error:', dbErr);
      }
    })();

    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Fortune error:', message);
    return jsonResponse({ ok: false, error: `운세 분석 중 오류가 발생했습니다: ${message}` }, 500);
  }
};
