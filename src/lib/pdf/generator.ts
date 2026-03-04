import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  format, getDaysInMonth, getDay, endOfWeek,
  eachWeekOfInterval, startOfYear, endOfYear,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getHolidays } from '@/lib/holidays';
import { getTemplate, toF } from './templates';
import type { PDFGenerateRequest } from '@/types';

// ── 폰트 CDN ─────────────────────────────────────────────
const FONT_KR_REGULAR = 'https://cdn.jsdelivr.net/gh/nicowillis/fonts@main/NotoSansKR-Regular.otf';
const FONT_KR_BOLD    = 'https://cdn.jsdelivr.net/gh/nicowillis/fonts@main/NotoSansKR-Bold.otf';

// ── 페이지 치수 (A4 가로) ─────────────────────────────────
const PAGE_W  = 841.89;
const PAGE_H  = 595.28;
const MARGIN  = 40;
const INNER_W = PAGE_W - MARGIN * 2;

// ── 레이아웃 불변 상수 ────────────────────────────────────
const DOW_KR      = ['일', '월', '화', '수', '목', '금', '토'];
const HDR_H       = 68;                                       // 섹션 헤더 높이
const FOOTER_Y    = 16;                                       // 풋터 기준 Y
const DAY_COL_W   = INNER_W / 7;                             // 요일/날짜 컬럼 폭
const CAL_GRID_TOP = PAGE_H - HDR_H;                         // 월별 그리드 상단 Y
const CAL_DOW_H   = 24;                                      // 요일 헤더 행 높이
const CAL_CELL_H  = Math.min(74, Math.floor((PAGE_H - HDR_H - CAL_DOW_H - 40) / 6));
const WEEK_COL_Y  = FOOTER_Y + 26;                           // 주간 컬럼 하단 Y
const WEEK_COL_H  = PAGE_H - HDR_H - WEEK_COL_Y;            // 주간 컬럼 높이

// ── 텍스트 줄바꿈 ─────────────────────────────────────────
function splitText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let i = 0;
  while (i < text.length) {
    const nl = text.indexOf('\n', i);
    if (nl !== -1 && nl - i < maxChars) {
      lines.push(text.slice(i, nl));
      i = nl + 1;
    } else {
      lines.push(text.slice(i, i + maxChars));
      i += maxChars;
    }
  }
  return lines;
}

// ── 드로잉 헬퍼 ──────────────────────────────────────────
function drawText(
  page: PDFPage, text: string, x: number, y: number,
  { size = 12, color = rgb(0, 0, 0), font }: { size?: number; color?: ReturnType<typeof rgb>; font: PDFFont }
) {
  try { page.drawText(text, { x, y, size, color, font }); } catch { /* 미지원 문자 무시 */ }
}

function rect(
  page: PDFPage, x: number, y: number, w: number, h: number,
  { color, borderColor, borderWidth = 0 }: {
    color?: ReturnType<typeof rgb>;
    borderColor?: ReturnType<typeof rgb>;
    borderWidth?: number;
  }
) {
  if (color) page.drawRectangle({ x, y, width: w, height: h, color });
  if (borderColor && borderWidth > 0)
    page.drawRectangle({ x, y, width: w, height: h, borderColor, borderWidth, color: undefined });
}

function line(page: PDFPage, x1: number, y1: number, x2: number, thick: number, color: ReturnType<typeof rgb>) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness: thick, color });
}

function circle(page: PDFPage, cx: number, cy: number, r: number, color: ReturnType<typeof rgb>) {
  page.drawEllipse({ x: cx, y: cy, xScale: r, yScale: r, color });
}

// ============================================================
// 메인 PDF 생성 함수
// ============================================================
export async function generatePDF(req: PDFGenerateRequest): Promise<Uint8Array> {
  const { year, template_key, fortune, user_name } = req;
  const tmpl = getTemplate(template_key);
  const C = tmpl.colors;
  const holidays = getHolidays(year);
  const holidayMap = new Map(holidays.map((h) => [h.date, h]));

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // ── 폰트 로드 (Regular + Bold 병렬, 6초 타임아웃) ────────
  async function loadKrFont(url: string): Promise<PDFFont | null> {
    try {
      const res = await Promise.race([
        fetch(url),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
      ]) as Response;
      if (!res.ok) return null;
      return pdfDoc.embedFont(await res.arrayBuffer());
    } catch { return null; }
  }

  const [fontKr, fontKrBold] = await Promise.all([
    loadKrFont(FONT_KR_REGULAR),
    loadKrFont(FONT_KR_BOLD),
  ]);
  const fontLatin     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontLatinBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 폰트 별칭 (한글 우선, 폴백 Latin)
  const fNorm = fontKr     ?? fontLatin;
  const fBold = fontKrBold ?? fontKr ?? fontLatinBold;

  // ── 색상 ─────────────────────────────────────────────────
  const pC      = rgb(...toF(C.primary));
  const bgC     = rgb(...toF(C.bg));
  const txtC    = rgb(...toF(C.text));
  const mutedC  = rgb(...toF(C.muted));
  const borderC = rgb(...toF(C.border));
  const accentC = rgb(...toF(C.accent));

  // border 색을 살짝 밝게 → 교대 행 배경
  const bArr    = toF(C.border);
  const altC    = rgb(Math.min(1, bArr[0] + 0.06), Math.min(1, bArr[1] + 0.06), Math.min(1, bArr[2] + 0.06));

  // 파스텔 요일 색 (토: 블루 / 일·공휴일: 레드)
  const satText    = rgb(0.22, 0.40, 0.76);
  const satBg      = rgb(0.87, 0.92, 0.98);
  const sunHolText = rgb(0.76, 0.18, 0.18);
  const sunHolBg   = rgb(0.99, 0.88, 0.88);

  // ── 페이지 관리 ───────────────────────────────────────────
  const pages: PDFPage[] = [];

  function addPage(): PDFPage {
    const pg = pdfDoc.addPage([PAGE_W, PAGE_H]);
    pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: bgC });
    pages.push(pg);
    return pg;
  }

  // 섹션 헤더 (컬러 배너 + accent 상단 스트라이프)
  function pageHeader(pg: PDFPage, title: string, sub?: string) {
    rect(pg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: pC });
    rect(pg, 0, PAGE_H - 3, PAGE_W, 3, { color: accentC }); // 최상단 accent 줄
    drawText(pg, title, MARGIN, PAGE_H - HDR_H + 24, { size: 20, color: bgC, font: fBold });
    if (sub) drawText(pg, sub, MARGIN, PAGE_H - HDR_H + 9, { size: 9, color: bgC, font: fNorm });
  }

  // 페이지 번호 풋터
  function footer(pg: PDFPage, section: string) {
    drawText(pg, section, MARGIN, FOOTER_Y, { size: 7, color: mutedC, font: fNorm });
    const pn = String(pages.length);
    drawText(pg, pn, PAGE_W - MARGIN - pn.length * 5, FOOTER_Y, { size: 7, color: mutedC, font: fontLatin });
  }

  // ── 1. 표지 ──────────────────────────────────────────────
  const cover = addPage();
  const SPLIT = 320;  // 좌측 패널 폭

  // 좌측 컬러 패널
  rect(cover, 0, 0, SPLIT, PAGE_H, { color: pC });
  // accent 세로 줄 (디바이더)
  rect(cover, SPLIT, 0, 4, PAGE_H, { color: accentC });
  // 좌측 콘텐츠
  drawText(cover, String(year), MARGIN, PAGE_H - 148, { size: 78, color: bgC, font: fBold });
  drawText(cover, 'PLANNER', MARGIN, PAGE_H - 176, { size: 20, color: bgC, font: fontLatinBold });
  line(cover, MARGIN, PAGE_H - 192, SPLIT - MARGIN, 2, accentC);
  if (user_name) {
    drawText(cover, user_name, MARGIN, PAGE_H - 210, { size: 12, color: bgC, font: fNorm });
  }
  drawText(cover, tmpl.name, MARGIN, 28, { size: 9, color: bgC, font: fNorm });

  // 우측 콘텐츠
  const rx = SPLIT + 28;
  drawText(cover, `${year}년도 연간 플래너`, rx, PAGE_H - 72, { size: 17, color: pC, font: fBold });
  line(cover, rx, PAGE_H - 84, PAGE_W - MARGIN, 0.8, borderC);
  const features = [
    '월별 캘린더 & 연간 개요',
    '52주 주간 플래너 (시간대별)',
    '12개월 습관 트래커',
    '분기별 목표 관리',
    '연간 가계부 & 메모',
    '공휴일 자동 표시',
  ];
  features.forEach((f, i) => {
    drawText(cover, `• ${f}`, rx, PAGE_H - 114 - i * 22, { size: 11, color: txtC, font: fNorm });
  });
  drawText(cover, 'planner-001.pages.dev', rx, 28, { size: 9, color: mutedC, font: fontLatin });
  footer(cover, '표지');

  // ── 2. 연간 개요 ─────────────────────────────────────────
  const yearPage = addPage();
  pageHeader(yearPage, `${year} 연간 개요`);
  footer(yearPage, '연간 개요');

  // 4열 × 3행 미니 캘린더 카드
  const ycCW = INNER_W / 4;
  const ycCH = (PAGE_H - HDR_H - 32) / 3;

  for (let m = 0; m < 12; m++) {
    const col = m % 4, row = Math.floor(m / 4);
    const cx = MARGIN + col * ycCW;
    const cy = PAGE_H - HDR_H - 8 - (row + 1) * ycCH;
    const cw = ycCW - 8, ch = ycCH - 6;
    const d1 = new Date(year, m, 1);

    // 카드 배경 + 테두리
    rect(yearPage, cx, cy, cw, ch, { color: borderC, borderColor: borderC, borderWidth: 0.5 });
    // 월 이름 헤더
    rect(yearPage, cx, cy + ch - 20, cw, 20, { color: pC });
    drawText(yearPage, format(d1, 'M월 MMMM', { locale: ko }), cx + 6, cy + ch - 14,
      { size: 8.5, color: bgC, font: fBold });

    // 요일 행
    const dcw = (cw - 2) / 7;
    for (let d = 0; d < 7; d++) {
      drawText(yearPage, DOW_KR[d], cx + 1 + d * dcw + dcw / 2 - 3, cy + ch - 32,
        { size: 6, color: d === 0 ? sunHolText : d === 6 ? satText : mutedC, font: fNorm });
    }

    // 날짜
    const firstDay = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7, dr = Math.floor(pos / 7);
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHol = holidayMap.has(dateStr);
      const tc = isHol || dc === 0 ? sunHolText : dc === 6 ? satText : txtC;
      drawText(yearPage, String(d),
        cx + 1 + dc * dcw + dcw / 2 - (d >= 10 ? 4 : 2), cy + ch - 44 - dr * 11,
        { size: 7, color: tc, font: fNorm });
    }
  }

  // ── 3. 월별 페이지 × 12 ──────────────────────────────────
  for (let m = 0; m < 12; m++) {
    const d1 = new Date(year, m, 1);
    const monthLabel = format(d1, 'M월', { locale: ko });
    const pg = addPage();
    pageHeader(pg, `${year}년 ${monthLabel}`, format(d1, 'MMMM yyyy', { locale: ko }));
    footer(pg, `${year}년 ${monthLabel}`);

    // 요일 헤더 행
    for (let d = 0; d < 7; d++) {
      const x = MARGIN + d * DAY_COL_W;
      const bg = d === 0 ? sunHolBg : d === 6 ? satBg : altC;
      rect(pg, x, CAL_GRID_TOP - CAL_DOW_H, DAY_COL_W, CAL_DOW_H, { color: bg });
      drawText(pg, DOW_KR[d], x + DAY_COL_W / 2 - 4, CAL_GRID_TOP - CAL_DOW_H + 8,
        { size: 10, color: d === 0 ? sunHolText : d === 6 ? satText : txtC, font: fBold });
    }

    const firstDay = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);

    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7, dr = Math.floor(pos / 7);
      const x = MARGIN + dc * DAY_COL_W;
      const y = CAL_GRID_TOP - CAL_DOW_H - (dr + 1) * CAL_CELL_H;
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);
      const isSun = dc === 0, isSat = dc === 6;
      const isSpecial = !!(hol || isSun || isSat);
      const textColor = hol || isSun ? sunHolText : isSat ? satText : txtC;

      // 교대 주 배경 (짝수 주: 아주 연하게)
      if (dr % 2 === 1) rect(pg, x, y, DAY_COL_W, CAL_CELL_H, { color: altC });
      rect(pg, x, y, DAY_COL_W, CAL_CELL_H, { borderColor: borderC, borderWidth: 0.35 });

      // 날짜 배지 (특별일: 원형, 일반: 텍스트)
      const badgeCx = x + 14;
      const badgeCy = y + CAL_CELL_H - 12;
      if (isSpecial) {
        circle(pg, badgeCx, badgeCy, 10, hol || isSun ? sunHolBg : satBg);
      }
      drawText(pg, String(d),
        badgeCx - (d >= 10 ? 6 : 3), badgeCy - 4,
        { size: 11, color: textColor, font: fBold });

      // 공휴일명
      if (hol) {
        drawText(pg, hol.name.slice(0, 7), x + 2, y + CAL_CELL_H - 26,
          { size: 6, color: sunHolText, font: fNorm });
      }

      // 셀 내부 필기 라인 (공간이 있을 때)
      if (CAL_CELL_H > 42) {
        for (let ln = 0; ln < 2; ln++) {
          const ly = y + 6 + ln * 14;
          if (ly + 10 < y + CAL_CELL_H - 28) {
            line(pg, x + 3, ly, x + DAY_COL_W - 3, 0.25, borderC);
          }
        }
      }
    }

    // 달력 하단 메모 영역
    const calBottom = CAL_GRID_TOP - CAL_DOW_H - 6 * CAL_CELL_H;
    const notesTop = calBottom - 6;
    if (notesTop > FOOTER_Y + 28) {
      line(pg, MARGIN, notesTop, PAGE_W - MARGIN, 0.6, borderC);
      drawText(pg, '메모', MARGIN, notesTop - 13, { size: 9, color: mutedC, font: fBold });
      const lcount = Math.min(4, Math.floor((notesTop - FOOTER_Y - 28) / 15));
      for (let i = 0; i < lcount; i++) {
        line(pg, MARGIN, notesTop - 26 - i * 15, PAGE_W - MARGIN, 0.3, borderC);
      }
    }
  }

  // ── 4. 주간 플래너 × 52주 ────────────────────────────────
  const weeks = eachWeekOfInterval(
    { start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) },
    { weekStartsOn: 0 }
  );

  weeks.forEach((weekStart, idx) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const wkNum   = idx + 1;
    const pg = addPage();

    // 주간 헤더
    rect(pg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: pC });
    rect(pg, 0, PAGE_H - 3, PAGE_W, 3, { color: accentC });
    // 주차 뱃지 원
    circle(pg, MARGIN + 24, PAGE_H - HDR_H / 2, 24, accentC);
    drawText(pg, String(wkNum), MARGIN + (wkNum >= 10 ? 17 : 21), PAGE_H - HDR_H / 2 - 5,
      { size: 14, color: pC, font: fontLatinBold });
    drawText(pg, 'W', MARGIN + (wkNum >= 10 ? 26 : 22), PAGE_H - HDR_H / 2 + 10,
      { size: 7, color: pC, font: fontLatin });

    drawText(pg, `${year}년 ${wkNum}주차`, MARGIN + 54, PAGE_H - HDR_H + 28,
      { size: 17, color: bgC, font: fBold });
    drawText(pg, `${format(weekStart, 'yyyy.MM.dd')} – ${format(weekEnd, 'yyyy.MM.dd')}`,
      MARGIN + 54, PAGE_H - HDR_H + 12, { size: 9, color: bgC, font: fontLatin });

    // 날짜 컬럼 × 7
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const hol = holidayMap.get(dateStr);
      const x = MARGIN + d * DAY_COL_W;
      const isSun = d === 0, isSat = d === 6;
      const isSpecial = !!(hol || isSun || isSat);
      const dayN = dayDate.getDate();

      // 컬럼 외곽 테두리
      rect(pg, x, WEEK_COL_Y, DAY_COL_W, WEEK_COL_H, { borderColor: borderC, borderWidth: 0.4 });

      // 요일 헤더 영역 (컬럼 상단 42px)
      const hdTop = WEEK_COL_Y + WEEK_COL_H - 42;
      const hdBg = hol || isSun ? sunHolBg : isSat ? satBg : altC;
      rect(pg, x, hdTop, DAY_COL_W, 42, { color: hdBg });

      // 날짜 원형 배지
      if (isSpecial) {
        circle(pg, x + DAY_COL_W / 2, hdTop + 28, 12, hol || isSun ? sunHolBg : satBg);
      }

      const dc = hol || isSun ? sunHolText : isSat ? satText : txtC;
      // 요일명
      drawText(pg, DOW_KR[d], x + DAY_COL_W / 2 - 4, hdTop + 30,
        { size: 9.5, color: dc, font: fBold });
      // 날짜
      drawText(pg, String(dayN),
        x + DAY_COL_W / 2 - (dayN >= 10 ? 5 : 3), hdTop + 16,
        { size: 8.5, color: mutedC, font: fontLatin });
      if (hol) {
        drawText(pg, hol.name.slice(0, 4), x + 2, hdTop + 4,
          { size: 6, color: sunHolText, font: fNorm });
      }

      // 시간 라인 06–22 (18pt 간격, 짝수 시간대 연한 배경)
      for (let h = 6; h <= 22; h++) {
        const hy = WEEK_COL_Y + WEEK_COL_H - 42 - (h - 5) * 18;
        if (hy < WEEK_COL_Y + 3) break;
        if (h % 2 === 0) rect(pg, x + 1, hy - 18, DAY_COL_W - 2, 18, { color: altC });
        line(pg, x + 1, hy, x + DAY_COL_W - 1, 0.25, borderC);
        if (h % 2 === 0) {
          drawText(pg, `${h < 10 ? '0' : ''}${h}`, x + 2, hy + 3,
            { size: 5.5, color: mutedC, font: fontLatin });
        }
      }
    }

    // 하단 주간 메모줄
    line(pg, MARGIN, WEEK_COL_Y + 18, PAGE_W - MARGIN, 0.5, borderC);
    drawText(pg, '이번 주 목표', MARGIN, WEEK_COL_Y + 8, { size: 8, color: mutedC, font: fBold });
    footer(pg, `${wkNum}주차`);
  });

  // ── 5. 운세 페이지 ───────────────────────────────────────
  if (fortune) {
    const fPg = addPage();
    pageHeader(fPg, '나의 운세', `${year}년도 운세 분석`);
    footer(fPg, '나의 운세');

    const summaryLines = splitText(fortune.summary ?? '', 88);
    summaryLines.forEach((ln, i) => {
      drawText(fPg, ln, MARGIN, PAGE_H - HDR_H - 28 - i * 18, { size: 11, color: txtC, font: fNorm });
    });
    if (fortune.lucky_colors?.length) {
      drawText(fPg, `행운의 색상: ${fortune.lucky_colors.join(', ')}`, MARGIN, 90,
        { size: 11, color: accentC, font: fBold });
    }
    if (fortune.lucky_numbers?.length) {
      drawText(fPg, `행운의 숫자: ${fortune.lucky_numbers.join(', ')}`, MARGIN, 70,
        { size: 11, color: accentC, font: fNorm });
    }

    // 월별 운세 (3열 × 4행)
    if (fortune.monthly_fortunes?.length) {
      const mfPg = addPage();
      pageHeader(mfPg, '월별 운세');
      footer(mfPg, '월별 운세');

      const mfColW = (INNER_W - 12) / 3;
      const mfRowH = (PAGE_H - HDR_H - 20) / 4;
      fortune.monthly_fortunes.slice(0, 12).forEach((mf, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = MARGIN + col * (mfColW + 6);
        const y = PAGE_H - HDR_H - 8 - (row + 1) * mfRowH;
        const h = mfRowH - 6;

        rect(mfPg, x, y, mfColW, h, { borderColor: borderC, borderWidth: 0.5 });
        rect(mfPg, x, y + h - 24, mfColW, 24, { color: pC });
        drawText(mfPg, `${mf.month}월`, x + 8, y + h - 16, { size: 12, color: bgC, font: fBold });
        drawText(mfPg, `${mf.score}/10`, x + mfColW - 36, y + h - 16,
          { size: 9, color: bgC, font: fontLatin });

        const fLines = splitText(mf.fortune, 30);
        fLines.slice(0, 4).forEach((ln, li) => {
          drawText(mfPg, ln, x + 6, y + h - 36 - li * 13, { size: 8.5, color: txtC, font: fNorm });
        });
      });
    }
  }

  // ── 6. 습관 트래커 × 12 ──────────────────────────────────
  for (let m = 0; m < 12; m++) {
    const pg = addPage();
    const d1 = new Date(year, m, 1);
    const monthName = format(d1, 'M월', { locale: ko });
    pageHeader(pg, `${monthName} 습관 트래커`);
    footer(pg, `${monthName} 습관 트래커`);

    const daysInMonth = getDaysInMonth(d1);
    const LABEL_W = 116;
    const trackW  = INNER_W - LABEL_W;
    const cellW   = trackW / daysInMonth;
    const ROWS    = 10;
    const cellH   = Math.min(30, Math.floor((PAGE_H - HDR_H - 32 - 32) / ROWS));
    const tTop    = PAGE_H - HDR_H - 10;

    // 습관 헤더 셀
    rect(pg, MARGIN, tTop - 26, LABEL_W, 26, { color: pC });
    drawText(pg, '습관 항목', MARGIN + 6, tTop - 18, { size: 9, color: bgC, font: fBold });

    // 날짜 헤더 행
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);
      const dow = getDay(new Date(year, m, d));
      const isSun = dow === 0, isSat = dow === 6;
      const hdBg = hol || isSun ? sunHolBg : isSat ? satBg : pC;
      const tc   = hol || isSun ? sunHolText : isSat ? satText : bgC;
      const cx   = MARGIN + LABEL_W + (d - 1) * cellW;
      rect(pg, cx, tTop - 26, cellW, 26, { color: hdBg });
      drawText(pg, String(d), cx + cellW / 2 - (d >= 10 ? 4 : 2), tTop - 17,
        { size: 7, color: tc, font: fontLatin });
    }

    // 데이터 행 (교대 배경)
    for (let r = 0; r < ROWS; r++) {
      const y = tTop - 26 - (r + 1) * cellH;
      if (r % 2 === 1) rect(pg, MARGIN, y, INNER_W, cellH, { color: altC });
      rect(pg, MARGIN, y, LABEL_W, cellH, { borderColor: borderC, borderWidth: 0.4 });
      for (let d = 1; d <= daysInMonth; d++) {
        rect(pg, MARGIN + LABEL_W + (d - 1) * cellW, y, cellW, cellH,
          { borderColor: borderC, borderWidth: 0.3 });
      }
    }
  }

  // ── 7. 목표 관리 ─────────────────────────────────────────
  const goalPg = addPage();
  pageHeader(goalPg, `${year}년 목표 관리`);
  footer(goalPg, '목표 관리');

  const gColW = (INNER_W - 12) / 2;
  const gRowH = (PAGE_H - HDR_H - 16) / 2 - 6;
  const qNames = ['1분기 (1–3월)', '2분기 (4–6월)', '3분기 (7–9월)', '4분기 (10–12월)'];

  qNames.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const gx = MARGIN + col * (gColW + 12);
    const gy = PAGE_H - HDR_H - 8 - row * (gRowH + 8);

    // 카드 외곽
    rect(goalPg, gx, gy - gRowH, gColW, gRowH, { borderColor: borderC, borderWidth: 0.6 });
    // 분기 헤더
    rect(goalPg, gx, gy - 28, gColW, 28, { color: pC });
    rect(goalPg, gx, gy - 3, gColW, 3, { color: accentC }); // accent 상단 줄
    drawText(goalPg, q, gx + 10, gy - 20, { size: 11, color: bgC, font: fBold });

    // 목표 항목 줄
    const lineCount = 6;
    const spacing = (gRowH - 36) / lineCount;
    for (let j = 0; j < lineCount; j++) {
      const ly = gy - 36 - (j + 1) * spacing;
      drawText(goalPg, `${j + 1}.`, gx + 8, ly + 4, { size: 10, color: mutedC, font: fBold });
      line(goalPg, gx + 24, ly, gx + gColW - 8, 0.4, borderC);
    }
  });

  // ── 8. 메모 × 4 ──────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const pg = addPage();
    // 심플 사이드 accent 바 방식 헤더
    rect(pg, MARGIN, PAGE_H - 62, 5, 42, { color: pC });
    rect(pg, MARGIN, PAGE_H - 20, 5, 5, { color: accentC });
    drawText(pg, 'MEMO', MARGIN + 14, PAGE_H - 46, { size: 26, color: pC, font: fontLatinBold });
    // 페이지 번호 원형 배지 (우상단)
    circle(pg, PAGE_W - MARGIN - 14, PAGE_H - 46, 12, pC);
    drawText(pg, String(i + 1),
      PAGE_W - MARGIN - (i >= 9 ? 19 : 17), PAGE_H - 51,
      { size: 10, color: bgC, font: fontLatinBold });
    line(pg, MARGIN, PAGE_H - 68, PAGE_W - MARGIN, 0.7, borderC);

    // 도트 그리드
    const dot_sp = 18;
    for (let dy = PAGE_H - 86; dy > FOOTER_Y + 18; dy -= dot_sp) {
      for (let dx = MARGIN + 4; dx < PAGE_W - MARGIN; dx += dot_sp) {
        pg.drawEllipse({ x: dx, y: dy, xScale: 0.85, yScale: 0.85, color: borderC });
      }
    }
    footer(pg, `메모 ${i + 1}`);
  }

  // ── 9. 가계부 ────────────────────────────────────────────
  const budgetPg = addPage();
  // 가계부는 accentC 헤더로 구분
  rect(budgetPg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: accentC });
  rect(budgetPg, 0, PAGE_H - 3, PAGE_W, 3, { color: pC });
  drawText(budgetPg, `${year}년 가계부`, MARGIN, PAGE_H - HDR_H + 24, { size: 20, color: bgC, font: fBold });
  drawText(budgetPg, '연간 수입 / 지출 추적', MARGIN, PAGE_H - HDR_H + 9, { size: 9, color: bgC, font: fNorm });
  footer(budgetPg, '가계부');

  const bHdrs = ['월', '수입', '지출', '저축', '합계', '메모'];
  const bCols = [36, 110, 110, 110, 110, INNER_W - 36 - 110 * 4];
  const bRowH = Math.floor((PAGE_H - HDR_H - 26 - 36) / 14); // 12개월 + 헤더 + 합계

  // 테이블 헤더
  let bx = MARGIN;
  bHdrs.forEach((h, hi) => {
    rect(budgetPg, bx, PAGE_H - HDR_H - bRowH - 6, bCols[hi], bRowH, { color: pC });
    drawText(budgetPg, h, bx + 5, PAGE_H - HDR_H - bRowH + 4, { size: 9, color: bgC, font: fBold });
    bx += bCols[hi];
  });

  // 월 행
  for (let m = 0; m < 12; m++) {
    let bx2 = MARGIN;
    const by = PAGE_H - HDR_H - bRowH - 6 - (m + 1) * (bRowH + 1);
    if (m % 2 === 1) rect(budgetPg, MARGIN, by, INNER_W, bRowH, { color: altC });
    bCols.forEach((cw) => {
      rect(budgetPg, bx2, by, cw, bRowH, { borderColor: borderC, borderWidth: 0.3 });
      bx2 += cw;
    });
    drawText(budgetPg, `${m + 1}월`, MARGIN + 5, by + bRowH / 2 - 4,
      { size: 9, color: txtC, font: fNorm });
  }

  // 합계 행
  const totalY = PAGE_H - HDR_H - bRowH - 6 - 13 * (bRowH + 1);
  rect(budgetPg, MARGIN, totalY, INNER_W, bRowH, { color: pC });
  drawText(budgetPg, '연간 합계', MARGIN + 5, totalY + bRowH / 2 - 4,
    { size: 9, color: bgC, font: fBold });

  return await pdfDoc.save();
}
