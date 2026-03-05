// ============================================================
// 사주·별자리 계산 유틸리티
// ============================================================

// ── 천간 (Heavenly Stems) ────────────────────────────────
export const CHEONGAN = ['갑','을','병','정','무','기','경','신','임','계'] as const;
export type Cheongan = typeof CHEONGAN[number];

// ── 지지 (Earthly Branches) ──────────────────────────────
export const JIJI = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export type Jiji = typeof JIJI[number];

// ── 오행 (Five Elements) ─────────────────────────────────
export const OHHAENG = ['목','화','토','금','수'] as const;
export type Ohhaeng = typeof OHHAENG[number];

// 천간 → 오행
export const CHEONGAN_OHHAENG: Record<Cheongan, Ohhaeng> = {
  갑:'목', 을:'목', 병:'화', 정:'화', 무:'토',
  기:'토', 경:'금', 신:'금', 임:'수', 계:'수',
};

// 천간 → 음양
export const CHEONGAN_NATURE: Record<Cheongan, string> = {
  갑:'양목', 을:'음목', 병:'양화', 정:'음화', 무:'양토',
  기:'음토', 경:'양금', 신:'음금', 임:'양수', 계:'음수',
};

// 지지 → 오행
export const JIJI_OHHAENG: Record<Jiji, Ohhaeng> = {
  자:'수', 축:'토', 인:'목', 묘:'목', 진:'토', 사:'화',
  오:'화', 미:'토', 신:'금', 유:'금', 술:'토', 해:'수',
};

// 지지 → 동물
export const JIJI_ANIMAL: Record<Jiji, string> = {
  자:'쥐', 축:'소', 인:'호랑이', 묘:'토끼', 진:'용', 사:'뱀',
  오:'말', 미:'양', 신:'원숭이', 유:'닭', 술:'개', 해:'돼지',
};

// ── 연도 → 간지 계산 ─────────────────────────────────────
export function getCheonganIdx(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}
export function getJijiIdx(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}
export function getCheongan(year: number): Cheongan {
  return CHEONGAN[getCheonganIdx(year)];
}
export function getJiji(year: number): Jiji {
  return JIJI[getJijiIdx(year)];
}
export function getGanji(year: number): string {
  const gan = getCheongan(year);
  const ji = getJiji(year);
  return `${gan}${ji}`;
}
export function getYearDescription(year: number): string {
  const ganji = getGanji(year);
  const ganEl = CHEONGAN_OHHAENG[getCheongan(year)];
  const jiEl  = JIJI_OHHAENG[getJiji(year)];
  const animal = JIJI_ANIMAL[getJiji(year)];
  return `${ganji}년 (${ganEl}${jiEl}의 기운, ${animal}의 해)`;
}

// ── 12지지 시간 (时柱) ───────────────────────────────────
export const BIRTH_HOUR_OPTIONS = [
  { label: '모름 / 불분명', range: '', jiji: '' },
  { label: '자시 (子時)', range: '23:00 – 00:59', jiji: '자' },
  { label: '축시 (丑時)', range: '01:00 – 02:59', jiji: '축' },
  { label: '인시 (寅時)', range: '03:00 – 04:59', jiji: '인' },
  { label: '묘시 (卯時)', range: '05:00 – 06:59', jiji: '묘' },
  { label: '진시 (辰時)', range: '07:00 – 08:59', jiji: '진' },
  { label: '사시 (巳時)', range: '09:00 – 10:59', jiji: '사' },
  { label: '오시 (午時)', range: '11:00 – 12:59', jiji: '오' },
  { label: '미시 (未時)', range: '13:00 – 14:59', jiji: '미' },
  { label: '신시 (申時)', range: '15:00 – 16:59', jiji: '신' },
  { label: '유시 (酉時)', range: '17:00 – 18:59', jiji: '유' },
  { label: '술시 (戌時)', range: '19:00 – 20:59', jiji: '술' },
  { label: '해시 (亥時)', range: '21:00 – 22:59', jiji: '해' },
] as const;

// 시각(HH:MM) → 지지
export function timeToJiji(time: string): string {
  const [h] = time.split(':').map(Number);
  if (h === 23 || h === 0) return '자';
  if (h === 1 || h === 2)  return '축';
  if (h === 3 || h === 4)  return '인';
  if (h === 5 || h === 6)  return '묘';
  if (h === 7 || h === 8)  return '진';
  if (h === 9 || h === 10) return '사';
  if (h === 11|| h === 12) return '오';
  if (h === 13|| h === 14) return '미';
  if (h === 15|| h === 16) return '신';
  if (h === 17|| h === 18) return '유';
  if (h === 19|| h === 20) return '술';
  return '해';
}

// ── 별자리 ───────────────────────────────────────────────
export const ZODIAC_LIST = [
  '양자리','황소자리','쌍둥이자리','게자리',
  '사자자리','처녀자리','천칭자리','전갈자리',
  '사수자리','염소자리','물병자리','물고기자리',
] as const;
export type ZodiacSign = typeof ZODIAC_LIST[number];

export const ZODIAC_SYMBOL: Record<ZodiacSign, string> = {
  양자리:'♈', 황소자리:'♉', 쌍둥이자리:'♊', 게자리:'♋',
  사자자리:'♌', 처녀자리:'♍', 천칭자리:'♎', 전갈자리:'♏',
  사수자리:'♐', 염소자리:'♑', 물병자리:'♒', 물고기자리:'♓',
};

export const ZODIAC_DATES: Record<ZodiacSign, string> = {
  양자리:'3.21–4.19', 황소자리:'4.20–5.20', 쌍둥이자리:'5.21–6.20',
  게자리:'6.21–7.22', 사자자리:'7.23–8.22', 처녀자리:'8.23–9.22',
  천칭자리:'9.23–10.22', 전갈자리:'10.23–11.21', 사수자리:'11.22–12.21',
  염소자리:'12.22–1.19', 물병자리:'1.20–2.18', 물고기자리:'2.19–3.20',
};

export const ZODIAC_ELEMENT: Record<ZodiacSign, string> = {
  양자리:'🔥불', 사자자리:'🔥불', 사수자리:'🔥불',
  황소자리:'🌍흙', 처녀자리:'🌍흙', 염소자리:'🌍흙',
  쌍둥이자리:'💨바람', 천칭자리:'💨바람', 물병자리:'💨바람',
  게자리:'💧물', 전갈자리:'💧물', 물고기자리:'💧물',
};

export const ZODIAC_RULER: Record<ZodiacSign, string> = {
  양자리:'화성', 황소자리:'금성', 쌍둥이자리:'수성', 게자리:'달',
  사자자리:'태양', 처녀자리:'수성', 천칭자리:'금성', 전갈자리:'명왕성',
  사수자리:'목성', 염소자리:'토성', 물병자리:'천왕성', 물고기자리:'해왕성',
};

export const ZODIAC_COLOR: Record<ZodiacSign, string> = {
  양자리:'from-red-500 to-rose-600',
  황소자리:'from-emerald-500 to-teal-600',
  쌍둥이자리:'from-yellow-400 to-amber-500',
  게자리:'from-blue-400 to-cyan-500',
  사자자리:'from-orange-500 to-amber-600',
  처녀자리:'from-green-500 to-emerald-600',
  천칭자리:'from-pink-400 to-rose-500',
  전갈자리:'from-purple-600 to-violet-700',
  사수자리:'from-violet-500 to-purple-600',
  염소자리:'from-slate-500 to-gray-600',
  물병자리:'from-sky-500 to-blue-600',
  물고기자리:'from-indigo-400 to-purple-500',
};

// 생년월일 → 별자리 자동 감지
export function detectZodiac(month: number, day: number): ZodiacSign {
  if ((month === 3  && day >= 21) || (month === 4  && day <= 19)) return '양자리';
  if ((month === 4  && day >= 20) || (month === 5  && day <= 20)) return '황소자리';
  if ((month === 5  && day >= 21) || (month === 6  && day <= 20)) return '쌍둥이자리';
  if ((month === 6  && day >= 21) || (month === 7  && day <= 22)) return '게자리';
  if ((month === 7  && day >= 23) || (month === 8  && day <= 22)) return '사자자리';
  if ((month === 8  && day >= 23) || (month === 9  && day <= 22)) return '처녀자리';
  if ((month === 9  && day >= 23) || (month === 10 && day <= 22)) return '천칭자리';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '전갈자리';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '사수자리';
  if ((month === 12 && day >= 22) || (month === 1  && day <= 19)) return '염소자리';
  if ((month === 1  && day >= 20) || (month === 2  && day <= 18)) return '물병자리';
  return '물고기자리';
}
