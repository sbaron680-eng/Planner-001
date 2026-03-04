import type { Holiday } from '@/types';

// ============================================================
// 한국 공휴일 & 대체공휴일 계산 라이브러리
// ============================================================

// 음력 → 양력 변환 테이블 (2024~2030)
// 설날 음력 1월 1일, 부처님오신날 음력 4월 8일, 추석 음력 8월 15일
const LUNAR_HOLIDAYS: Record<number, { seollal: string; buddha: string; chuseok: string }> = {
  2024: { seollal: '2024-02-10', buddha: '2024-05-15', chuseok: '2024-09-17' },
  2025: { seollal: '2025-01-29', buddha: '2025-05-05', chuseok: '2025-10-06' },
  2026: { seollal: '2026-02-17', buddha: '2026-05-24', chuseok: '2026-10-05' },
  2027: { seollal: '2027-02-07', buddha: '2027-05-13', chuseok: '2027-09-24' },
  2028: { seollal: '2028-01-26', buddha: '2028-05-02', chuseok: '2028-09-12' },
  2029: { seollal: '2029-02-13', buddha: '2029-05-20', chuseok: '2029-10-01' },
  2030: { seollal: '2030-02-03', buddha: '2030-05-09', chuseok: '2030-09-20' },
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay(); // 0=일, 6=토
}

// 대체공휴일 계산 (2023년 이후 전면 확대)
function getSubstituteHoliday(holidays: Holiday[]): Holiday[] {
  const substitutes: Holiday[] = [];
  const existingDates = new Set(holidays.map((h) => h.date));

  for (const h of holidays) {
    const dow = getDayOfWeek(h.date);
    if (dow === 0) {
      // 일요일 → 다음 평일 중 공휴일 아닌 날
      let candidate = addDays(h.date, 1);
      while (existingDates.has(candidate) || getDayOfWeek(candidate) === 0) {
        candidate = addDays(candidate, 1);
      }
      if (!existingDates.has(candidate)) {
        existingDates.add(candidate);
        substitutes.push({ date: candidate, name: `${h.name} 대체공휴일`, type: 'substitute' });
      }
    } else if (dow === 6) {
      // 토요일 → 다음 평일 중 공휴일 아닌 날
      let candidate = addDays(h.date, 2);
      while (existingDates.has(candidate) || getDayOfWeek(candidate) === 0) {
        candidate = addDays(candidate, 1);
      }
      if (!existingDates.has(candidate)) {
        existingDates.add(candidate);
        substitutes.push({ date: candidate, name: `${h.name} 대체공휴일`, type: 'substitute' });
      }
    }
  }

  return substitutes;
}

export function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // ── 양력 고정 공휴일 ─────────────────────────────────
  const fixed: [string, string][] = [
    [`${year}-01-01`, '신정'],
    [`${year}-03-01`, '삼일절'],
    [`${year}-05-05`, '어린이날'],
    [`${year}-06-06`, '현충일'],
    [`${year}-08-15`, '광복절'],
    [`${year}-10-03`, '개천절'],
    [`${year}-10-09`, '한글날'],
    [`${year}-12-25`, '성탄절'],
  ];
  for (const [date, name] of fixed) {
    holidays.push({ date, name, type: 'public' });
  }

  // ── 음력 기반 공휴일 ─────────────────────────────────
  const lunar = LUNAR_HOLIDAYS[year];
  if (lunar) {
    // 설날 (전날, 당일, 다음날)
    holidays.push({ date: addDays(lunar.seollal, -1), name: '설날 연휴', type: 'public' });
    holidays.push({ date: lunar.seollal, name: '설날', type: 'public' });
    holidays.push({ date: addDays(lunar.seollal, 1), name: '설날 연휴', type: 'public' });

    // 부처님오신날
    holidays.push({ date: lunar.buddha, name: '부처님오신날', type: 'public' });

    // 추석 (전날, 당일, 다음날)
    holidays.push({ date: addDays(lunar.chuseok, -1), name: '추석 연휴', type: 'public' });
    holidays.push({ date: lunar.chuseok, name: '추석', type: 'public' });
    holidays.push({ date: addDays(lunar.chuseok, 1), name: '추석 연휴', type: 'public' });
  }

  // ── 대체공휴일 계산 ──────────────────────────────────
  const substitutes = getSubstituteHoliday(holidays);
  holidays.push(...substitutes);

  // 날짜순 정렬
  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

export function getHolidayMap(year: number): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (const h of getHolidays(year)) {
    map.set(h.date, h);
  }
  return map;
}

export function isHoliday(date: string, year: number): Holiday | undefined {
  return getHolidayMap(year).get(date);
}

// ── 플래너 기준 연도 계산 ─────────────────────────────
// 11월 1일부터는 다음 해 플래너 연도 사용
export function getPlannerYear(): number {
  const now = new Date();
  if (now.getMonth() >= 10) {   // 11월(10) 이상
    return now.getFullYear() + 1;
  }
  return now.getFullYear();
}
