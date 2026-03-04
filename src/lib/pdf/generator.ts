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

// ============================================================
// 한글 폰트 URL (Noto Sans KR - Google Fonts CDN)
// ============================================================
const NOTO_SANS_KR_URL =
  'https://cdn.jsdelivr.net/gh/nicowillis/fonts@main/NotoSansKR-Regular.otf';

// A4 가로 (Landscape) - 플래너 최적화
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const MARGIN = 40;
const INNER_W = PAGE_W - MARGIN * 2;

// ── 루프 불변 상수 ────────────────────────────────────────
const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_COL_W = INNER_W / 7;          // 월별 cW == 주간 dW
const CAL_GRID_TOP = PAGE_H - 80;       // 월별 달력 그리드 상단
const CAL_CELL_H = Math.min(80, Math.floor((PAGE_H - 80 - 22 - 90) / 6)); // 동적 셀 높이
const WEEK_COL_H = PAGE_H - 120 - 50;  // 주간 컬럼 높이

// ── 텍스트 줄바꿈 헬퍼 (slice 기반, O(n) 문자 연결 제거) ──
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

// ── 헬퍼: 한글 호환 텍스트 그리기 ────────────────────────
function drawText(
  page: PDFPage,
  text: string,
  x: number, y: number,
  { size = 12, color = rgb(0, 0, 0), font }: { size?: number; color?: ReturnType<typeof rgb>; font: PDFFont }
) {
  try {
    page.drawText(text, { x, y, size, color, font });
  } catch {
    // 폰트에 없는 문자 → 무시
  }
}

// ── 헬퍼: 직사각형 ──────────────────────────────────────
function rect(
  page: PDFPage,
  x: number, y: number, w: number, h: number,
  { color, borderColor, borderWidth = 0 }: {
    color?: ReturnType<typeof rgb>;
    borderColor?: ReturnType<typeof rgb>;
    borderWidth?: number;
  }
) {
  if (color) {
    page.drawRectangle({ x, y, width: w, height: h, color });
  }
  if (borderColor && borderWidth > 0) {
    page.drawRectangle({
      x, y, width: w, height: h,
      borderColor, borderWidth, color: undefined,
    });
  }
}

// ── 헬퍼: 수평선 ──────────────────────────────────────
function line(page: PDFPage, x1: number, y1: number, x2: number, thickness: number, color: ReturnType<typeof rgb>) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness, color });
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

  // ── 폰트 로드 (5초 타임아웃) ─────────────────────────
  let fontKr: PDFFont | null = null;
  try {
    const fetchWithTimeout = Promise.race([
      fetch(NOTO_SANS_KR_URL),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('font timeout')), 5000)),
    ]);
    const fontRes = await fetchWithTimeout;
    if ((fontRes as Response).ok) {
      const fontBytes = await (fontRes as Response).arrayBuffer();
      fontKr = await pdfDoc.embedFont(fontBytes);
    }
  } catch {
    // 한글 폰트 로드 실패 시 기본 폰트 사용
  }
  const fontBase = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = fontKr ?? fontBase;

  // ── 색상 상수 ─────────────────────────────────────────
  const pC       = rgb(...toF(C.primary));
  const bgC      = rgb(...toF(C.bg));
  const txtC     = rgb(...toF(C.text));
  const mutedC   = rgb(...toF(C.muted));
  const borderC  = rgb(...toF(C.border));
  const accentC  = rgb(...toF(C.accent));
  const borderFillC = borderC; // border 배경으로 재사용 (rgb(...toF(C.border)) inline 제거)

  // ── 파스텔 요일 색상 ────────────────────────────────
  // 토요일: 파스텔 블루 / 일요일·공휴일: 파스텔 레드
  const satText    = rgb(0.25, 0.44, 0.78);
  const satBg      = rgb(0.86, 0.91, 0.98);
  const sunHolText = rgb(0.78, 0.22, 0.22);
  const sunHolBg   = rgb(0.99, 0.87, 0.87);

  // 페이지 참조 추적 (하이퍼링크용)
  const pageRefs: { label: string; pageIndex: number }[] = [];
  const pages: PDFPage[] = [];

  function addPage(): PDFPage {
    const pg = pdfDoc.addPage([PAGE_W, PAGE_H]);
    pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: bgC });
    pages.push(pg);
    return pg;
  }

  // ── 1. 표지 ──────────────────────────────────────────
  pageRefs.push({ label: '표지', pageIndex: 0 });
  const cover = addPage();
  rect(cover, 0, PAGE_H * 0.55, PAGE_W, PAGE_H * 0.45, { color: pC });
  drawText(cover, `${year}`, MARGIN, PAGE_H - 90, { size: 64, color: bgC, font: fontBold });
  drawText(cover, 'PLANNER', MARGIN, PAGE_H - 125, { size: 26, color: bgC, font: fontBold });
  if (user_name) {
    drawText(cover, user_name, MARGIN, PAGE_H - 150, { size: 13, color: bgC, font });
  }
  drawText(cover, `${year}년도 연간 플래너`, MARGIN, 165, { size: 20, color: pC, font });
  drawText(cover, '· PDF 내부 하이퍼링크 내비게이션', MARGIN, 140, { size: 11, color: txtC, font });
  drawText(cover, '· 공휴일 자동 표시', MARGIN, 122, { size: 11, color: txtC, font });
  drawText(cover, '· 월별 / 주간 / 일별 계획 완비', MARGIN, 104, { size: 11, color: txtC, font });
  drawText(cover, 'planner-001.pages.dev', MARGIN, 55, { size: 10, color: mutedC, font });

  // ── 2. 연간 개요 (Year at a Glance) ─────────────────
  pageRefs.push({ label: '연간 개요', pageIndex: 1 });
  const yearPage = addPage();
  drawText(yearPage, `${year} 연간 개요`, MARGIN, PAGE_H - 55, { size: 20, color: pC, font: fontBold });
  line(yearPage, MARGIN, PAGE_H - 65, PAGE_W - MARGIN, 1, borderC);

  const colW = INNER_W / 4;
  const rowH = 130;
  for (let m = 0; m < 12; m++) {
    const col = m % 4;
    const row = Math.floor(m / 4);
    const mx = MARGIN + col * colW;
    const my = PAGE_H - 95 - row * rowH;
    const d1 = new Date(year, m, 1);

    drawText(yearPage, format(d1, 'M월', { locale: ko }), mx + 4, my, { size: 11, color: pC, font: fontBold });
    line(yearPage, mx, my - 6, mx + colW - 8, 0.5, borderC);

    for (let d = 0; d < 7; d++) {
      drawText(yearPage, DOW_KR[d], mx + d * 14 + 2, my - 18,
        { size: 7, color: d === 0 ? sunHolText : d === 6 ? satText : mutedC, font });
    }

    const firstDay = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7;
      const dr = Math.floor(pos / 7);
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHol = holidayMap.has(dateStr);
      const isSun = dc === 0;
      const isSat = dc === 6;
      const textColor = isHol || isSun ? sunHolText : isSat ? satText : txtC;
      drawText(yearPage, String(d), mx + dc * 14 + 2, my - 32 - dr * 12, { size: 7, color: textColor, font });
    }
  }

  // ── 3. 월별 페이지 × 12 ──────────────────────────────
  for (let m = 0; m < 12; m++) {
    const d1 = new Date(year, m, 1);
    const monthLabel = format(d1, 'M월', { locale: ko });
    pageRefs.push({ label: monthLabel, pageIndex: pages.length });
    const pg = addPage();

    // 헤더
    rect(pg, 0, PAGE_H - 80, PAGE_W, 80, { color: pC });
    drawText(pg, `${year}년 ${monthLabel}`, MARGIN, PAGE_H - 52, { size: 22, color: bgC, font: fontBold });

    // 요일 헤더 행
    for (let d = 0; d < 7; d++) {
      const x = MARGIN + d * DAY_COL_W;
      rect(pg, x, CAL_GRID_TOP - 22, DAY_COL_W, 22, {
        color: d === 0 ? sunHolBg : d === 6 ? satBg : borderFillC,
      });
      drawText(pg, DOW_KR[d], x + DAY_COL_W / 2 - 5, CAL_GRID_TOP - 16,
        { size: 10, color: d === 0 ? sunHolText : d === 6 ? satText : txtC, font: fontBold });
    }

    const firstDay = getDay(d1);
    const daysInMonth = getDaysInMonth(d1);
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7;
      const dr = Math.floor(pos / 7);
      const x = MARGIN + dc * DAY_COL_W;
      const y = CAL_GRID_TOP - 22 - (dr + 1) * CAL_CELL_H;
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);
      const isSun = dc === 0;
      const isSat = dc === 6;
      const textColor = hol || isSun ? sunHolText : isSat ? satText : txtC;

      rect(pg, x, y, DAY_COL_W, CAL_CELL_H, { borderColor: borderC, borderWidth: 0.5 });

      if (hol || isSun || isSat) {
        rect(pg, x, y + CAL_CELL_H - 20, DAY_COL_W, 20, {
          color: hol || isSun ? sunHolBg : satBg,
        });
      }

      drawText(pg, String(d), x + 5, y + CAL_CELL_H - 15, { size: 11, color: textColor, font: fontBold });
      if (hol) {
        drawText(pg, hol.name.slice(0, 6), x + 2, y + CAL_CELL_H - 28, { size: 7, color: sunHolText, font });
      }
    }

    // 메모 영역 (공간이 있을 때만 표시)
    const notesY = CAL_GRID_TOP - 22 - 6 * CAL_CELL_H - 12;
    if (notesY > MARGIN + 25) {
      line(pg, MARGIN, notesY, PAGE_W - MARGIN, 0.5, borderC);
      drawText(pg, '메모', MARGIN, notesY - 13, { size: 10, color: mutedC, font: fontBold });
      for (let i = 0; i < 4; i++) {
        const ly = notesY - 30 - i * 18;
        if (ly < MARGIN) break;
        line(pg, MARGIN, ly, PAGE_W - MARGIN, 0.3, borderC);
      }
    }
  }

  // ── 4. 주간 플래너 × 52주 ───────────────────────────
  const weeks = eachWeekOfInterval(
    { start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) },
    { weekStartsOn: 0 }
  );

  weeks.forEach((weekStart, idx) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const label = `${format(weekStart, 'M/d')}주`;
    pageRefs.push({ label, pageIndex: pages.length });
    const pg = addPage();

    const wkNum = idx + 1;
    drawText(pg, `${year}년 ${wkNum}주차`, MARGIN, PAGE_H - 50, { size: 16, color: pC, font: fontBold });
    drawText(pg, `${format(weekStart, 'yyyy.MM.dd')} – ${format(weekEnd, 'yyyy.MM.dd')}`,
      MARGIN, PAGE_H - 68, { size: 10, color: mutedC, font });
    line(pg, MARGIN, PAGE_H - 76, PAGE_W - MARGIN, 0.8, pC);

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const hol = holidayMap.get(dateStr);
      const x = MARGIN + d * DAY_COL_W;
      const y = 50;
      const isSun = d === 0;
      const isSat = d === 6;

      rect(pg, x, y, DAY_COL_W, WEEK_COL_H, { borderColor: borderC, borderWidth: 0.5 });

      const hdBg = hol || isSun ? sunHolBg : isSat ? satBg : borderFillC;
      rect(pg, x, y + WEEK_COL_H - 30, DAY_COL_W, 30, { color: hdBg });

      const dc = hol || isSun ? sunHolText : isSat ? satText : txtC;
      drawText(pg, DOW_KR[d], x + 6, y + WEEK_COL_H - 20, { size: 10, color: dc, font: fontBold });
      drawText(pg, String(dayDate.getDate()), x + 6, y + WEEK_COL_H - 33, { size: 9, color: mutedC, font });
      if (hol) {
        drawText(pg, hol.name.slice(0, 4), x + 2, y + WEEK_COL_H - 44, { size: 7, color: sunHolText, font });
      }

      // 시간 라인 06-22
      for (let h = 6; h <= 22; h++) {
        const hy = y + WEEK_COL_H - 30 - (h - 5) * 20;
        if (hy < y + 5) break;
        line(pg, x + 2, hy, x + DAY_COL_W - 2, 0.2, borderC);
        if (h % 2 === 0) drawText(pg, String(h), x + 2, hy + 2, { size: 6, color: mutedC, font });
      }
    }

    drawText(pg, '이번 주 목표 / 메모', MARGIN, 42, { size: 10, color: mutedC, font: fontBold });
    line(pg, MARGIN, 36, PAGE_W - MARGIN, 0.5, borderC);
  });

  // ── 5. 운세 페이지 (fortune 있을 경우) ───────────────
  if (fortune) {
    pageRefs.push({ label: '나의 운세', pageIndex: pages.length });
    const fPg = addPage();
    rect(fPg, 0, PAGE_H - 120, PAGE_W, 120, { color: pC });
    drawText(fPg, '나의 운세', MARGIN, PAGE_H - 55, { size: 22, color: bgC, font: fontBold });
    drawText(fPg, `${year}년도 운세 분석`, MARGIN, PAGE_H - 80, { size: 13, color: bgC, font });

    const summaryLines = splitText(fortune.summary ?? '', 90);
    summaryLines.forEach((ln, i) => {
      drawText(fPg, ln, MARGIN, PAGE_H - 145 - i * 18, { size: 11, color: txtC, font });
    });

    if (fortune.lucky_colors?.length) {
      drawText(fPg, `행운의 색상: ${fortune.lucky_colors.join(', ')}`, MARGIN, 120,
        { size: 11, color: accentC, font: fontBold });
    }
    if (fortune.lucky_numbers?.length) {
      drawText(fPg, `행운의 숫자: ${fortune.lucky_numbers.join(', ')}`, MARGIN, 100,
        { size: 11, color: accentC, font });
    }

    // 월별 운세 (가로형: 3열 4행 레이아웃)
    if (fortune.monthly_fortunes?.length) {
      pageRefs.push({ label: '월별 운세', pageIndex: pages.length });
      const mfPg = addPage();
      drawText(mfPg, '월별 운세', MARGIN, PAGE_H - 55, { size: 20, color: pC, font: fontBold });
      line(mfPg, MARGIN, PAGE_H - 65, PAGE_W - MARGIN, 1, borderC);

      const mfColW = (INNER_W - 10) / 3;
      fortune.monthly_fortunes.slice(0, 12).forEach((mf, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = MARGIN + col * (mfColW + 5);
        const y = PAGE_H - 90 - row * 100;

        rect(mfPg, x, y - 80, mfColW, 85, { borderColor: borderC, borderWidth: 0.5 });
        rect(mfPg, x, y - 18, mfColW, 23, { color: borderFillC });
        drawText(mfPg, `${mf.month}월`, x + 6, y - 12, { size: 12, color: pC, font: fontBold });
        drawText(mfPg, `점수: ${mf.score}/10`, x + 46, y - 12, { size: 10, color: mutedC, font });

        const fLines = splitText(mf.fortune, 28);
        fLines.slice(0, 3).forEach((ln, li) => {
          drawText(mfPg, ln, x + 6, y - 35 - li * 15, { size: 9, color: txtC, font });
        });
      });
    }
  }

  // ── 6. 습관 트래커 × 12 ──────────────────────────────
  pageRefs.push({ label: '습관 트래커', pageIndex: pages.length });
  for (let m = 0; m < 12; m++) {
    const pg = addPage();
    const d1 = new Date(year, m, 1);
    const monthName = format(d1, 'M월', { locale: ko });
    drawText(pg, `${monthName} 습관 트래커`, MARGIN, PAGE_H - 50, { size: 18, color: pC, font: fontBold });
    line(pg, MARGIN, PAGE_H - 60, PAGE_W - MARGIN, 0.8, pC);

    const daysInMonth = getDaysInMonth(d1);
    const rows = 8;
    const cellW = INNER_W / (daysInMonth + 1);
    const cellH = 28;

    drawText(pg, '습관', MARGIN, PAGE_H - 80, { size: 9, color: mutedC, font: fontBold });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);
      const dow = getDay(new Date(year, m, d));
      const isSun = dow === 0;
      const tc = hol || isSun ? sunHolText : dow === 6 ? satText : mutedC;
      drawText(pg, String(d), MARGIN + cellW * d, PAGE_H - 80, { size: 8, color: tc, font });
    }

    for (let r = 0; r < rows; r++) {
      const y = PAGE_H - 95 - r * cellH;
      rect(pg, MARGIN, y, cellW - 2, cellH - 2, { borderColor: borderC, borderWidth: 0.5 });
      for (let d = 1; d <= daysInMonth; d++) {
        rect(pg, MARGIN + cellW * d, y, cellW - 2, cellH - 2, { borderColor: borderC, borderWidth: 0.5 });
      }
    }
  }

  // ── 7. 목표 관리 (가로형: 2열 2행 레이아웃) ──────────
  pageRefs.push({ label: '목표 관리', pageIndex: pages.length });
  const goalPg = addPage();
  rect(goalPg, 0, PAGE_H - 80, PAGE_W, 80, { color: pC });
  drawText(goalPg, `${year}년 목표 관리`, MARGIN, PAGE_H - 52, { size: 20, color: bgC, font: fontBold });

  const gColW = (INNER_W - 10) / 2;
  const qNames = ['1분기', '2분기', '3분기', '4분기'];
  qNames.forEach((q, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const gx = MARGIN + col * (gColW + 10);
    const gy = PAGE_H - 105 - row * 170;

    rect(goalPg, gx, gy - 150, gColW, 155, { borderColor: borderC, borderWidth: 0.7 });
    rect(goalPg, gx, gy - 20, gColW, 25, { color: borderFillC });
    drawText(goalPg, q, gx + 8, gy - 12, { size: 12, color: pC, font: fontBold });
    for (let j = 0; j < 5; j++) {
      const ly = gy - 45 - j * 25;
      drawText(goalPg, `${j + 1}.`, gx + 8, ly + 5, { size: 11, color: mutedC, font });
      line(goalPg, gx + 22, ly, gx + gColW - 5, 0.4, borderC);
    }
  });

  // ── 8. 메모 페이지 × 4 ──────────────────────────────
  pageRefs.push({ label: '메모', pageIndex: pages.length });
  for (let i = 0; i < 4; i++) {
    const pg = addPage();
    drawText(pg, 'MEMO', MARGIN, PAGE_H - 55, { size: 28, color: pC, font: fontBold });
    line(pg, MARGIN, PAGE_H - 68, PAGE_W - MARGIN, 1, pC);
    for (let l = 0; l < 22; l++) {
      line(pg, MARGIN, PAGE_H - 90 - l * 22, PAGE_W - MARGIN, 0.4, borderC);
    }
    drawText(pg, String(i + 1), PAGE_W - MARGIN - 10, 40, { size: 10, color: mutedC, font });
  }

  // ── 9. 가계부 (연간 요약) ────────────────────────────
  pageRefs.push({ label: '가계부', pageIndex: pages.length });
  const budgetPg = addPage();
  rect(budgetPg, 0, PAGE_H - 80, PAGE_W, 80, { color: accentC });
  drawText(budgetPg, `${year}년 가계부`, MARGIN, PAGE_H - 52, { size: 20, color: bgC, font: fontBold });

  const headers = ['월', '수입', '지출', '저축', '합계'];
  const colWs = [40, 120, 120, 120, 120];
  let tx = MARGIN;
  headers.forEach((h, hi) => {
    rect(budgetPg, tx, PAGE_H - 103, colWs[hi], 22, { color: borderFillC });
    drawText(budgetPg, h, tx + 5, PAGE_H - 98, { size: 10, color: pC, font: fontBold });
    tx += colWs[hi];
  });
  for (let m = 0; m < 12; m++) {
    let bx = MARGIN;
    const by = PAGE_H - 103 - (m + 1) * 24;
    colWs.forEach((cw) => {
      rect(budgetPg, bx, by, cw, 22, { borderColor: borderC, borderWidth: 0.4 });
      bx += cw;
    });
    drawText(budgetPg, `${m + 1}월`, MARGIN + 5, by + 7, { size: 10, color: txtC, font });
  }

  return await pdfDoc.save();
}
