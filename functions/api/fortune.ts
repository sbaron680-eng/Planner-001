import type { PagesFunction } from '@cloudflare/workers-types';
import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../_types';
import { jsonResponse } from '../_middleware';
import type { FortuneResult, MonthlyFortune } from '../../src/types';

function buildSajuPrompt(input: { name: string; birth_date: string; birth_time?: string; gender: string; year: number }): string {
  return `당신은 한국 사주명리학 전문가입니다. 다음 정보로 ${input.year}년 사주 운세를 분석해주세요.

이름: ${input.name}
생년월일: ${input.birth_date}
태어난 시간: ${input.birth_time ?? '모름'}
성별: ${input.gender === 'male' ? '남성' : '여성'}
운세 연도: ${input.year}년

다음 JSON 형식으로 정확히 응답해주세요:
{
  "summary": "종합 운세 요약 (200자)",
  "yearly_fortune": "연간 운세 상세 (300자)",
  "relationships": "인간관계·사랑운 (150자)",
  "career": "직업·사업운 (150자)",
  "wealth": "금전·재물운 (150자)",
  "health": "건강운 (100자)",
  "lucky_colors": ["색1", "색2"],
  "lucky_numbers": [숫자1, 숫자2, 숫자3],
  "monthly_fortunes": [
    {"month": 1, "fortune": "1월 운세 (80자)", "score": 7, "keywords": ["키워드1", "키워드2"]},
    ...12개월 전부...
  ]
}

JSON만 응답하고 다른 텍스트는 포함하지 마세요.`;
}

function buildAstrologyPrompt(input: { name: string; birth_date: string; zodiac?: string; year: number }): string {
  const zodiac = input.zodiac || '생년월일에서 자동 감지';
  return `당신은 서양 점성술 전문가입니다. 다음 정보로 ${input.year}년 별자리 운세를 분석해주세요.

이름: ${input.name}
생년월일: ${input.birth_date}
별자리: ${zodiac}
운세 연도: ${input.year}년

다음 JSON 형식으로 정확히 응답해주세요:
{
  "summary": "종합 운세 요약 (200자)",
  "yearly_fortune": "연간 운세 상세 (300자)",
  "relationships": "사랑운 (150자)",
  "career": "직업운 (150자)",
  "wealth": "금전운 (150자)",
  "health": "건강운 (100자)",
  "lucky_colors": ["색1", "색2"],
  "lucky_numbers": [숫자1, 숫자2, 숫자3],
  "monthly_fortunes": [
    {"month": 1, "fortune": "1월 운세 (80자)", "score": 7, "keywords": ["키워드1", "키워드2"]},
    ...12개월 전부...
  ]
}

JSON만 응답하고 다른 텍스트는 포함하지 마세요.`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as {
      type: 'saju' | 'astrology';
      input: Record<string, unknown>;
    };

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const prompt = body.type === 'saju'
      ? buildSajuPrompt(body.input as Parameters<typeof buildSajuPrompt>[0])
      : buildAstrologyPrompt(body.input as Parameters<typeof buildAstrologyPrompt>[0]);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text) as Omit<FortuneResult, 'id' | 'type'> & { monthly_fortunes: MonthlyFortune[] };

    const result: FortuneResult = {
      id: crypto.randomUUID(),
      type: body.type === 'saju' ? 'saju' : 'astrology',
      ...parsed,
    };

    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    console.error('Fortune error:', err);
    return jsonResponse({ ok: false, error: '운세 분석 중 오류가 발생했습니다.' }, 500);
  }
};
