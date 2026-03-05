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

// ── 폰트: @fontsource woff (fontkit은 woff2/Brotli 미지원) ──
import fontKrRegUrl    from '@fontsource/noto-sans-kr/files/noto-sans-kr-korean-400-normal.woff?url';
import fontKrBoldUrl   from '@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff?url';
import fontLatRegUrl   from '@fontsource/noto-sans-kr/files/noto-sans-kr-latin-400-normal.woff?url';
import fontLatBoldUrl  from '@fontsource/noto-sans-kr/files/noto-sans-kr-latin-700-normal.woff?url';

// ── A4 가로 (pt): 297mm × 210mm ───────────────────────────
const PAGE_W  = 841.89;
const PAGE_H  = 595.28;
const MARGIN  = 36;
const INNER_W = PAGE_W - MARGIN * 2;

// ── 레이아웃 상수 ────────────────────────────────────────
const DOW_KR    = ['일', '월', '화', '수', '목', '금', '토'];
const HDR_H     = 52;
const FOOTER_Y  = 11;

const CAL_TOP    = PAGE_H - HDR_H;
const CAL_DOW_H  = 22;
const CAL_ROWS   = 6;
const CAL_BOT    = 32;
const CAL_CELL_H = Math.floor((CAL_TOP - CAL_DOW_H - CAL_BOT) / CAL_ROWS);

const DAY_COL_W    = INNER_W / 7;
const WEEK_HDR_H   = 44;
const WEEK_COL_BOT = FOOTER_Y + 20;
const WEEK_COL_H   = PAGE_H - HDR_H - WEEK_COL_BOT;
const WEEK_HOURS   = 17;
const WEEK_GOAL_H  = 28;
const WEEK_SLOT_H  = Math.floor((WEEK_COL_H - WEEK_HDR_H - WEEK_GOAL_H) / WEEK_HOURS);

// ── 한글 판별 ─────────────────────────────────────────────
function isKoreanChar(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (cp >= 0xAC00 && cp <= 0xD7AF)  // 한글 음절
    || (cp >= 0x1100 && cp <= 0x11FF)    // 한글 자모
    || (cp >= 0x3130 && cp <= 0x318F);   // 한글 호환 자모
}

// ── 텍스트 세그먼트 분리 (한글 / 비한글) ─────────────────
function segmentText(text: string): { seg: string; korean: boolean }[] {
  const runs: { seg: string; korean: boolean }[] = [];
  let cur = '', curKo: boolean | null = null;
  for (const ch of text) {
    const ko = isKoreanChar(ch);
    if (curKo === null) curKo = ko;
    if (ko !== curKo) { runs.push({ seg: cur, korean: curKo }); cur = ''; curKo = ko; }
    cur += ch;
  }
  if (cur) runs.push({ seg: cur, korean: curKo! });
  return runs;
}

// ── 줄바꿈 ────────────────────────────────────────────────
function splitText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let i = 0;
  while (i < text.length) {
    const nl = text.indexOf('\n', i);
    if (nl !== -1 && nl - i <= maxChars) { lines.push(text.slice(i, nl)); i = nl + 1; }
    else { lines.push(text.slice(i, i + maxChars)); i += maxChars; }
  }
  return lines;
}

// ── 드로잉 헬퍼 ──────────────────────────────────────────
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

function hline(page: PDFPage, x1: number, y: number, x2: number, thick: number, color: ReturnType<typeof rgb>) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: thick, color });
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

  // ── 폰트 로드 ────────────────────────────────────────────
  async function loadFont(url: string): Promise<PDFFont | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await pdfDoc.embedFont(await res.arrayBuffer());
    } catch { return null; }
  }

  const [fontKr, fontKrBold, fontLatReg, fontLatBold] = await Promise.all([
    loadFont(fontKrRegUrl),
    loadFont(fontKrBoldUrl),
    loadFont(fontLatRegUrl),
    loadFont(fontLatBoldUrl),
  ]);

  // 한글 폰트 로드 실패 시 내장 Latin 폴백
  const fallbackReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fallbackBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fKr   = fontKr     ?? fallbackReg;
  const fKrB  = fontKrBold ?? fontKr ?? fallbackBold;
  const fLat  = fontLatReg ?? fallbackReg;
  const fLatB = fontLatBold ?? fontKr ?? fallbackBold;

  // ── 혼합 텍스트 드로잉 (한글/숫자 자동 분리) ─────────────
  function drawT(
    page: PDFPage, text: string, x: number, y: number,
    { size = 11, color = rgb(0, 0, 0), bold = false }: {
      size?: number;
      color?: ReturnType<typeof rgb>;
      bold?: boolean;
    }
  ) {
    if (!text) return;
    const segs = segmentText(text);
    let cx = x;
    for (const { seg, korean } of segs) {
      const font = korean ? (bold ? fKrB : fKr) : (bold ? fLatB : fLat);
      try {
        page.drawText(seg, { x: cx, y, size, color, font });
        cx += font.widthOfTextAtSize(seg, size);
      } catch {
        cx += seg.length * size * 0.5; // 실패 시 추정 폭으로 전진
      }
    }
  }

  // 명시적 Latin-only (숫자·영문만 있는 경우)
  function drawLat(
    page: PDFPage, text: string, x: number, y: number,
    { size = 11, color = rgb(0, 0, 0), bold = false }: {
      size?: number; color?: ReturnType<typeof rgb>; bold?: boolean;
    }
  ) {
    if (!text) return;
    const font = bold ? fLatB : fLat;
    try { page.drawText(text, { x, y, size, color, font }); } catch { }
  }

  // ── 색상 ─────────────────────────────────────────────────
  const pC      = rgb(...toF(C.primary));
  const bgC     = rgb(...toF(C.bg));
  const txtC    = rgb(...toF(C.text));
  const mutedC  = rgb(...toF(C.muted));
  const borderC = rgb(...toF(C.border));
  const accentC = rgb(...toF(C.accent));
  const bArr    = toF(C.border);
  const altC    = rgb(
    Math.min(1, bArr[0] + 0.05),
    Math.min(1, bArr[1] + 0.05),
    Math.min(1, bArr[2] + 0.05),
  );
  const satText    = rgb(0.22, 0.40, 0.76);
  const satBg      = rgb(0.88, 0.93, 0.99);
  const sunHolText = rgb(0.72, 0.15, 0.15);
  const sunHolBg   = rgb(0.99, 0.88, 0.88);

  // ── 페이지 관리 ───────────────────────────────────────────
  const pages: PDFPage[] = [];

  function addPage(): PDFPage {
    const pg = pdfDoc.addPage([PAGE_W, PAGE_H]);
    pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: bgC });
    pages.push(pg);
    return pg;
  }

  function pageHeader(pg: PDFPage, title: string, sub?: string) {
    rect(pg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: pC });
    rect(pg, 0, PAGE_H - 3, PAGE_W, 3, { color: accentC });
    drawT(pg, title, MARGIN, PAGE_H - HDR_H + 18, { size: 18, color: bgC, bold: true });
    if (sub) drawT(pg, sub, MARGIN, PAGE_H - HDR_H + 6, { size: 8, color: bgC });
  }

  function footer(pg: PDFPage, section: string) {
    drawT(pg, section, MARGIN, FOOTER_Y, { size: 7, color: mutedC });
    const pn = String(pages.length);
    drawLat(pg, pn, PAGE_W - MARGIN - pn.length * 4, FOOTER_Y, { size: 7, color: mutedC });
  }

  // ─────────────────────────────────────────────────────────
  // 1. 표지
  // ─────────────────────────────────────────────────────────
  const cover = addPage();
  const SPLIT = 310;

  rect(cover, 0, 0, SPLIT, PAGE_H, { color: pC });
  rect(cover, SPLIT, 0, 5, PAGE_H, { color: accentC });

  drawLat(cover, String(year), MARGIN, PAGE_H - 148, { size: 74, color: bgC, bold: true });
  drawLat(cover, 'PLANNER',   MARGIN, PAGE_H - 174, { size: 18, color: bgC, bold: true });
  hline(cover, MARGIN, PAGE_H - 186, SPLIT - MARGIN, 2, accentC);
  if (user_name) drawT(cover, user_name, MARGIN, PAGE_H - 200, { size: 11, color: bgC });
  drawT(cover, tmpl.name, MARGIN, 26, { size: 9, color: bgC });

  const rx = SPLIT + 26;
  drawT(cover, `${year}년도 연간 플래너`, rx, PAGE_H - 64, { size: 16, color: pC, bold: true });
  hline(cover, rx, PAGE_H - 76, PAGE_W - MARGIN, 0.7, borderC);

  const features = [
    '월별 캘린더 & 연간 개요',
    '52주 주간 플래너 (시간대별)',
    '12개월 습관 트래커',
    '분기별 목표 관리',
    '연간 가계부',
    '공휴일 자동 표시',
  ];
  features.forEach((f, i) => {
    drawT(cover, `• ${f}`, rx, PAGE_H - 106 - i * 22, { size: 10.5, color: txtC });
  });
  drawLat(cover, 'planner-001.pages.dev', rx, 26, { size: 8.5, color: mutedC });
  footer(cover, '표지');

  // ─────────────────────────────────────────────────────────
  // 2. 연간 개요
  // ─────────────────────────────────────────────────────────
  const yearPage = addPage();
  pageHeader(yearPage, `${year} 연간 개요`);
  footer(yearPage, '연간 개요');

  const ycPad = 6;
  const ycCW  = (INNER_W - ycPad * 3) / 4;
  const ycCH  = (PAGE_H - HDR_H - ycPad * 2 - 12) / 3;

  for (let m = 0; m < 12; m++) {
    const col = m % 4, row = Math.floor(m / 4);
    const cx  = MARGIN + col * (ycCW + ycPad);
    const cy  = CAL_TOP - 8 - (row + 1) * ycCH;
    const cw  = ycCW - 2, ch = ycCH - ycPad;
    const d1  = new Date(year, m, 1);
    const hdrH = 20;

    rect(yearPage, cx, cy, cw, ch, { borderColor: borderC, borderWidth: 0.5 });
    rect(yearPage, cx, cy + ch - hdrH, cw, hdrH, { color: pC });
    drawT(yearPage, format(d1, 'M월 MMMM', { locale: ko }),
      cx + 6, cy + ch - hdrH + 6, { size: 8, color: bgC, bold: true });

    const dcw = (cw - 2) / 7;
    for (let d = 0; d < 7; d++) {
      const tc = d === 0 ? sunHolText : d === 6 ? satText : mutedC;
      drawT(yearPage, DOW_KR[d], cx + 1 + d * dcw + dcw / 2 - 3, cy + ch - hdrH - 12,
        { size: 5.5, color: tc });
    }

    const firstDay    = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);
    for (let d = 1; d <= daysInMonth; d++) {
      const pos  = firstDay + d - 1;
      const dc   = pos % 7, dr = Math.floor(pos / 7);
      const dStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHol = holidayMap.has(dStr);
      const tc   = isHol || dc === 0 ? sunHolText : dc === 6 ? satText : txtC;
      drawLat(yearPage, String(d),
        cx + 1 + dc * dcw + dcw / 2 - (d >= 10 ? 3.5 : 2), cy + ch - hdrH - 22 - dr * 10,
        { size: 6.5, color: tc });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. 월별 페이지 × 12
  // ─────────────────────────────────────────────────────────
  for (let m = 0; m < 12; m++) {
    const d1         = new Date(year, m, 1);
    const monthLabel = format(d1, 'M월', { locale: ko });
    const pg         = addPage();
    pageHeader(pg, `${year}년 ${monthLabel}`, format(d1, 'MMMM yyyy', { locale: ko }));
    footer(pg, `${year}년 ${monthLabel}`);

    for (let d = 0; d < 7; d++) {
      const x  = MARGIN + d * DAY_COL_W;
      const bg = d === 0 ? sunHolBg : d === 6 ? satBg : altC;
      const tc = d === 0 ? sunHolText : d === 6 ? satText : txtC;
      rect(pg, x, CAL_TOP - CAL_DOW_H, DAY_COL_W, CAL_DOW_H, { color: bg });
      drawT(pg, DOW_KR[d], x + DAY_COL_W / 2 - 4, CAL_TOP - CAL_DOW_H + 7,
        { size: 9.5, color: tc, bold: true });
    }

    const firstDay    = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);

    for (let d = 1; d <= daysInMonth; d++) {
      const pos    = firstDay + d - 1;
      const dc     = pos % 7, dr = Math.floor(pos / 7);
      const x      = MARGIN + dc * DAY_COL_W;
      const y      = CAL_TOP - CAL_DOW_H - (dr + 1) * CAL_CELL_H;
      const dStr   = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol    = holidayMap.get(dStr);
      const isSun  = dc === 0, isSat = dc === 6;
      const special = !!(hol || isSun || isSat);
      const tc     = hol || isSun ? sunHolText : isSat ? satText : txtC;

      if (dr % 2 === 1) rect(pg, x, y, DAY_COL_W, CAL_CELL_H, { color: altC });
      rect(pg, x, y, DAY_COL_W, CAL_CELL_H, { borderColor: borderC, borderWidth: 0.3 });

      const bx = x + 14, by = y + CAL_CELL_H - 13;
      if (special) circle(pg, bx, by, 10, hol || isSun ? sunHolBg : satBg);
      drawLat(pg, String(d), bx - (d >= 10 ? 6 : 3), by - 4, { size: 11, color: tc, bold: true });

      if (hol)
        drawT(pg, hol.name.slice(0, 8), x + 2, y + CAL_CELL_H - 26, { size: 5.5, color: sunHolText });

      if (CAL_CELL_H >= 50) {
        const lineCount = Math.min(3, Math.floor((CAL_CELL_H - 28) / 14));
        for (let ln = 0; ln < lineCount; ln++) {
          const ly = y + 5 + ln * 14;
          if (ly < by - 16) hline(pg, x + 3, ly, x + DAY_COL_W - 3, 0.22, borderC);
        }
      }
    }

    const calBottom = CAL_TOP - CAL_DOW_H - CAL_ROWS * CAL_CELL_H;
    const notesTop  = calBottom - 4;
    if (notesTop > FOOTER_Y + 26) {
      hline(pg, MARGIN, notesTop, PAGE_W - MARGIN, 0.6, borderC);
      drawT(pg, '메모', MARGIN, notesTop - 13, { size: 8, color: mutedC, bold: true });
      const available = notesTop - FOOTER_Y - 26;
      const lineCount = Math.min(4, Math.floor(available / 14));
      for (let i = 0; i < lineCount; i++)
        hline(pg, MARGIN, notesTop - 25 - i * 14, PAGE_W - MARGIN, 0.28, borderC);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. 주간 플래너 × 52주
  // ─────────────────────────────────────────────────────────
  const weeks = eachWeekOfInterval(
    { start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) },
    { weekStartsOn: 0 },
  );

  weeks.forEach((weekStart, idx) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const wkNum   = idx + 1;
    const pg      = addPage();

    rect(pg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: pC });
    rect(pg, 0, PAGE_H - 3, PAGE_W, 3, { color: accentC });
    circle(pg, MARGIN + 22, PAGE_H - HDR_H / 2, 22, accentC);
    drawLat(pg, String(wkNum),
      MARGIN + (wkNum >= 10 ? 15 : 19), PAGE_H - HDR_H / 2 - 5,
      { size: 13, color: pC, bold: true });
    drawLat(pg, 'W',
      MARGIN + (wkNum >= 10 ? 24 : 20), PAGE_H - HDR_H / 2 + 9,
      { size: 6, color: pC });
    drawT(pg, `${year}년 ${wkNum}주차`,
      MARGIN + 50, PAGE_H - HDR_H + 24, { size: 15, color: bgC, bold: true });
    drawLat(pg,
      `${format(weekStart, 'yyyy.MM.dd')} – ${format(weekEnd, 'yyyy.MM.dd')}`,
      MARGIN + 50, PAGE_H - HDR_H + 10, { size: 8.5, color: bgC });

    const colTop = WEEK_COL_BOT + WEEK_COL_H;
    const hdTop  = colTop - WEEK_HDR_H;

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d);
      const dStr  = format(dayDate, 'yyyy-MM-dd');
      const hol   = holidayMap.get(dStr);
      const x     = MARGIN + d * DAY_COL_W;
      const isSun = d === 0, isSat = d === 6;
      const dayN  = dayDate.getDate();
      const tc    = hol || isSun ? sunHolText : isSat ? satText : txtC;

      rect(pg, x, WEEK_COL_BOT, DAY_COL_W, WEEK_COL_H, { borderColor: borderC, borderWidth: 0.4 });

      const hdBg = hol || isSun ? sunHolBg : isSat ? satBg : altC;
      rect(pg, x, hdTop, DAY_COL_W, WEEK_HDR_H, { color: hdBg });

      drawT(pg, DOW_KR[d],
        x + DAY_COL_W / 2 - 4, hdTop + WEEK_HDR_H - 13,
        { size: 9.5, color: tc, bold: true });
      drawLat(pg, String(dayN),
        x + DAY_COL_W / 2 - (dayN >= 10 ? 5 : 3), hdTop + WEEK_HDR_H - 26,
        { size: 8, color: mutedC });
      if (hol) drawT(pg, hol.name.slice(0, 5), x + 2, hdTop + 4, { size: 5.5, color: sunHolText });

      // 시간 슬롯 (06–22시)
      for (let si = 0; si < WEEK_HOURS; si++) {
        const h  = 6 + si;
        const sy = hdTop - (si + 1) * WEEK_SLOT_H;
        if (sy < WEEK_COL_BOT + WEEK_GOAL_H) break;
        if (si % 2 === 0) rect(pg, x + 1, sy, DAY_COL_W - 2, WEEK_SLOT_H, { color: altC });
        hline(pg, x + 1, sy + WEEK_SLOT_H, x + DAY_COL_W - 1, 0.25, borderC);
        if (h % 2 === 0) {
          drawLat(pg, `${h < 10 ? '0' : ''}${h}`, x + 2, sy + WEEK_SLOT_H - 7,
            { size: 5.5, color: mutedC });
        }
      }
    }

    const goalY = WEEK_COL_BOT + WEEK_GOAL_H;
    hline(pg, MARGIN, goalY, PAGE_W - MARGIN, 0.5, borderC);
    drawT(pg, '이번 주 목표 / 메모', MARGIN, WEEK_COL_BOT + 8, { size: 7.5, color: mutedC, bold: true });
    footer(pg, `${wkNum}주차`);
  });

  // ─────────────────────────────────────────────────────────
  // 5. 운세 페이지
  // ─────────────────────────────────────────────────────────
  if (fortune) {
    const fPg = addPage();
    pageHeader(fPg, '나의 운세', `${year}년도 운세 분석`);
    footer(fPg, '나의 운세');

    const summaryLines = splitText(fortune.summary ?? '', 84);
    summaryLines.forEach((ln, i) => {
      drawT(fPg, ln, MARGIN, CAL_TOP - 24 - i * 17, { size: 10.5, color: txtC });
    });
    if (fortune.lucky_colors?.length)
      drawT(fPg, `행운의 색상: ${fortune.lucky_colors.join(', ')}`, MARGIN, 90,
        { size: 10.5, color: accentC, bold: true });
    if (fortune.lucky_numbers?.length)
      drawT(fPg, `행운의 숫자: ${fortune.lucky_numbers.join(', ')}`, MARGIN, 72,
        { size: 10.5, color: accentC });

    if (fortune.monthly_fortunes?.length) {
      const mfPg = addPage();
      pageHeader(mfPg, '월별 운세');
      footer(mfPg, '월별 운세');

      const mfPad  = 8;
      const mfColW = (INNER_W - mfPad * 2) / 3;
      const mfRowH = (CAL_TOP - mfPad - 8) / 4;

      fortune.monthly_fortunes.slice(0, 12).forEach((mf, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x   = MARGIN + col * (mfColW + mfPad);
        const y   = CAL_TOP - 8 - (row + 1) * mfRowH;
        const h   = mfRowH - mfPad;
        const mhdrH = 24;

        rect(mfPg, x, y, mfColW, h, { borderColor: borderC, borderWidth: 0.5 });
        rect(mfPg, x, y + h - mhdrH, mfColW, mhdrH, { color: pC });
        drawT(mfPg, `${mf.month}월`, x + 8, y + h - mhdrH + 8, { size: 11, color: bgC, bold: true });
        drawLat(mfPg, `${mf.score}/10`, x + mfColW - 38, y + h - mhdrH + 8, { size: 8.5, color: bgC });
        const fLines = splitText(mf.fortune, 28);
        fLines.slice(0, 4).forEach((ln, li) => {
          drawT(mfPg, ln, x + 6, y + h - mhdrH - 14 - li * 13, { size: 8, color: txtC });
        });
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 6. 습관 트래커 × 12
  // ─────────────────────────────────────────────────────────
  for (let m = 0; m < 12; m++) {
    const pg        = addPage();
    const d1        = new Date(year, m, 1);
    const monthName = format(d1, 'M월', { locale: ko });
    pageHeader(pg, `${monthName} 습관 트래커`);
    footer(pg, `${monthName} 습관 트래커`);

    const daysInMonth = getDaysInMonth(d1);
    const LABEL_W     = 112;
    const trackW      = INNER_W - LABEL_W;
    const cellW       = trackW / daysInMonth;
    const ROWS        = 10;
    const hdH         = 24;
    const cellH       = Math.min(32, Math.floor((PAGE_H - HDR_H - hdH - FOOTER_Y - 24) / ROWS));
    const tTop        = PAGE_H - HDR_H - 8;

    rect(pg, MARGIN, tTop - hdH, LABEL_W, hdH, { color: pC });
    drawT(pg, '습관 항목', MARGIN + 6, tTop - hdH + 8, { size: 8.5, color: bgC, bold: true });

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr  = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol   = holidayMap.get(dStr);
      const dow   = getDay(new Date(year, m, d));
      const isSun = dow === 0, isSat = dow === 6;
      const hdBg  = hol || isSun ? sunHolBg : isSat ? satBg : pC;
      const tc    = hol || isSun ? sunHolText : isSat ? satText : bgC;
      const cx    = MARGIN + LABEL_W + (d - 1) * cellW;
      rect(pg, cx, tTop - hdH, cellW, hdH, { color: hdBg });
      drawLat(pg, String(d),
        cx + cellW / 2 - (d >= 10 ? 3.5 : 2), tTop - hdH + 9, { size: 6.5, color: tc });
    }

    for (let r = 0; r < ROWS; r++) {
      const y = tTop - hdH - (r + 1) * cellH;
      if (r % 2 === 1) rect(pg, MARGIN, y, INNER_W, cellH, { color: altC });
      rect(pg, MARGIN, y, LABEL_W, cellH, { borderColor: borderC, borderWidth: 0.4 });
      for (let d = 1; d <= daysInMonth; d++) {
        rect(pg, MARGIN + LABEL_W + (d - 1) * cellW, y, cellW, cellH,
          { borderColor: borderC, borderWidth: 0.28 });
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 7. 목표 관리
  // ─────────────────────────────────────────────────────────
  const goalPg = addPage();
  pageHeader(goalPg, `${year}년 목표 관리`);
  footer(goalPg, '목표 관리');

  const gPad  = 10;
  const gColW = (INNER_W - gPad) / 2;
  const gRowH = (CAL_TOP - gPad - 12) / 2;
  const qNames = ['1분기 (1–3월)', '2분기 (4–6월)', '3분기 (7–9월)', '4분기 (10–12월)'];

  qNames.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const gx  = MARGIN + col * (gColW + gPad);
    const gy  = CAL_TOP - 6 - row * (gRowH + gPad);
    const gh  = gRowH - 4;
    const gHdrH = 26;

    rect(goalPg, gx, gy - gh, gColW, gh, { borderColor: borderC, borderWidth: 0.5 });
    rect(goalPg, gx, gy - gHdrH, gColW, gHdrH, { color: pC });
    rect(goalPg, gx, gy - 3, gColW, 3, { color: accentC });
    drawT(goalPg, q, gx + 8, gy - gHdrH + 9, { size: 10.5, color: bgC, bold: true });

    const itemCount = 6;
    const spacing   = (gh - gHdrH - 12) / itemCount;
    for (let j = 0; j < itemCount; j++) {
      const ly = gy - gHdrH - 14 - (j + 1) * spacing;
      drawLat(goalPg, `${j + 1}.`, gx + 8, ly + 4, { size: 9.5, color: mutedC, bold: true });
      hline(goalPg, gx + 24, ly, gx + gColW - 8, 0.4, borderC);
    }
  });

  // ─────────────────────────────────────────────────────────
  // 8. 메모 × 4
  // ─────────────────────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const pg = addPage();
    rect(pg, MARGIN, PAGE_H - 58, 4, 38, { color: pC });
    rect(pg, MARGIN, PAGE_H - 20, 4, 5, { color: accentC });
    drawLat(pg, 'MEMO', MARGIN + 12, PAGE_H - 44, { size: 24, color: pC, bold: true });
    circle(pg, PAGE_W - MARGIN - 14, PAGE_H - 44, 12, pC);
    drawLat(pg, String(i + 1),
      PAGE_W - MARGIN - (i >= 9 ? 19 : 17), PAGE_H - 49,
      { size: 10, color: bgC, bold: true });
    hline(pg, MARGIN, PAGE_H - 62, PAGE_W - MARGIN, 0.7, borderC);

    const dot_sp = 18;
    for (let dy = PAGE_H - 80; dy > FOOTER_Y + 16; dy -= dot_sp)
      for (let dx = MARGIN + 4; dx < PAGE_W - MARGIN; dx += dot_sp)
        pg.drawEllipse({ x: dx, y: dy, xScale: 0.8, yScale: 0.8, color: borderC });

    footer(pg, `메모 ${i + 1}`);
  }

  // ─────────────────────────────────────────────────────────
  // 9. 가계부
  // ─────────────────────────────────────────────────────────
  const budgetPg = addPage();
  rect(budgetPg, 0, PAGE_H - HDR_H, PAGE_W, HDR_H, { color: accentC });
  rect(budgetPg, 0, PAGE_H - 3, PAGE_W, 3, { color: pC });
  drawT(budgetPg, `${year}년 가계부`, MARGIN, PAGE_H - HDR_H + 18, { size: 18, color: bgC, bold: true });
  drawT(budgetPg, '연간 수입 / 지출 추적', MARGIN, PAGE_H - HDR_H + 6, { size: 8, color: bgC });
  footer(budgetPg, '가계부');

  const bHdrs = ['월', '수입', '지출', '저축', '합계', '메모'];
  const firstW = 34, numW = 108;
  const bCols  = [firstW, numW, numW, numW, numW, INNER_W - firstW - numW * 4];
  const bRows  = 14;
  const bRowH  = Math.floor((CAL_TOP - HDR_H - 8 - FOOTER_Y - 14) / bRows);

  let bx = MARGIN;
  bHdrs.forEach((h, hi) => {
    rect(budgetPg, bx, CAL_TOP - bRowH, bCols[hi], bRowH, { color: pC });
    drawT(budgetPg, h, bx + 5, CAL_TOP - bRowH + (bRowH - 9) / 2, { size: 9, color: bgC, bold: true });
    bx += bCols[hi];
  });

  for (let m = 0; m < 12; m++) {
    let bx2 = MARGIN;
    const by = CAL_TOP - bRowH - (m + 1) * (bRowH + 1);
    if (m % 2 === 1) rect(budgetPg, MARGIN, by, INNER_W, bRowH, { color: altC });
    bCols.forEach((cw) => {
      rect(budgetPg, bx2, by, cw, bRowH, { borderColor: borderC, borderWidth: 0.3 });
      bx2 += cw;
    });
    drawT(budgetPg, `${m + 1}월`, MARGIN + 5, by + (bRowH - 9) / 2, { size: 9, color: txtC });
  }

  const totalY = CAL_TOP - bRowH - 13 * (bRowH + 1);
  rect(budgetPg, MARGIN, totalY, INNER_W, bRowH, { color: pC });
  drawT(budgetPg, '연간 합계', MARGIN + 5, totalY + (bRowH - 9) / 2, { size: 9, color: bgC, bold: true });

  return await pdfDoc.save();
}
