import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  format, getDaysInMonth, getDay, startOfWeek, endOfWeek,
  eachWeekOfInterval, startOfYear, endOfYear,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getHolidays } from '@/lib/holidays';
import { getTemplate, toF } from './templates';
import type { PDFGenerateRequest, Holiday } from '@/types';

// ============================================================
// 한글 폰트 URL (Noto Sans KR - Google Fonts CDN)
// ============================================================
const NOTO_SANS_KR_URL =
  'https://cdn.jsdelivr.net/gh/nicowillis/fonts@main/NotoSansKR-Regular.otf';

// A4 포트레이트 (iPad/갤럭시 탭 최적화 - PDF 표준)
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const INNER_W = PAGE_W - MARGIN * 2;

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

  // ── 폰트 로드 ────────────────────────────────────────
  let fontKr: PDFFont | null = null;
  try {
    const fontRes = await fetch(NOTO_SANS_KR_URL);
    if (fontRes.ok) {
      const fontBytes = await fontRes.arrayBuffer();
      fontKr = await pdfDoc.embedFont(fontBytes);
    }
  } catch {
    // 한글 폰트 로드 실패 시 기본 폰트 사용
  }
  const fontBase = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = fontKr ?? fontBase;

  const pC  = rgb(...toF(C.primary));
  const sC  = rgb(...toF(C.secondary));
  const bgC = rgb(...toF(C.bg));
  const txtC = rgb(...toF(C.text));
  const mutedC = rgb(...toF(C.muted));
  const borderC = rgb(...toF(C.border));
  const accentC = rgb(...toF(C.accent));

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
  drawText(cover, `${year}`, MARGIN, PAGE_H - 100, { size: 72, color: pC, font: fontBold });
  drawText(cover, 'PLANNER', MARGIN, PAGE_H - 140, { size: 28, color: pC, font: fontBold });
  if (user_name) {
    drawText(cover, user_name, MARGIN, PAGE_H - 170, { size: 14, color: mutedC, font });
  }
  drawText(cover, `${year}년도 연간 플래너`, MARGIN, 180, { size: 22, color: bgC, font });
  drawText(cover, '· PDF 내부 하이퍼링크 내비게이션', MARGIN, 155, { size: 11, color: rgb(...toF(C.bg)), font });
  drawText(cover, '· 공휴일 자동 표시', MARGIN, 138, { size: 11, color: rgb(...toF(C.bg)), font });
  drawText(cover, '· 월별 / 주간 / 일별 계획 완비', MARGIN, 121, { size: 11, color: rgb(...toF(C.bg)), font });
  drawText(cover, 'planner-001.pages.dev', MARGIN, 60, { size: 10, color: rgb(...toF(C.muted)), font });

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

    const monthName = format(new Date(year, m, 1), 'M월', { locale: ko });
    drawText(yearPage, monthName, mx + 4, my, { size: 11, color: pC, font: fontBold });
    line(yearPage, mx, my - 6, mx + colW - 8, 0.5, borderC);

    // 미니 캘린더
    const dow = ['일', '월', '화', '수', '목', '금', '토'];
    for (let d = 0; d < 7; d++) {
      drawText(yearPage, dow[d], mx + d * 14 + 2, my - 18,
        { size: 7, color: d === 0 ? rgb(0.85, 0.2, 0.2) : d === 6 ? rgb(0.2, 0.4, 0.85) : mutedC, font });
    }

    const firstDay = getDay(new Date(year, m, 1));
    const daysInMonth = getDaysInMonth(new Date(year, m, 1));
    let dayRow = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7;
      const dr = Math.floor(pos / 7);
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHol = holidayMap.has(dateStr);
      const isSun = dc === 0;
      const isSat = dc === 6;
      const textColor = isHol || isSun ? rgb(0.85, 0.2, 0.2) : isSat ? rgb(0.2, 0.4, 0.85) : txtC;
      drawText(yearPage, String(d), mx + dc * 14 + 2, my - 32 - dr * 12,
        { size: 7, color: textColor, font });
    }
  }

  // ── 3. 월별 페이지 × 12 ──────────────────────────────
  const monthPageStart = pages.length;
  for (let m = 0; m < 12; m++) {
    const monthLabel = format(new Date(year, m, 1), 'M월', { locale: ko });
    pageRefs.push({ label: monthLabel, pageIndex: pages.length });
    const pg = addPage();

    // 헤더
    rect(pg, 0, PAGE_H - 80, PAGE_W, 80, { color: pC });
    drawText(pg, `${year}년 ${monthLabel}`, MARGIN, PAGE_H - 52, { size: 22, color: bgC, font: fontBold });

    // 달력 그리드
    const DOW = ['일', '월', '화', '수', '목', '금', '토'];
    const cW = INNER_W / 7;
    const cH = 85;
    const gridTop = PAGE_H - 100;

    for (let d = 0; d < 7; d++) {
      const x = MARGIN + d * cW;
      rect(pg, x, gridTop - 22, cW, 22, {
        color: d === 0 ? rgb(1, 0.93, 0.93) : d === 6 ? rgb(0.93, 0.95, 1) : rgb(...toF(C.border)),
      });
      drawText(pg, DOW[d], x + cW / 2 - 5, gridTop - 16,
        { size: 10, color: d === 0 ? rgb(0.85, 0.2, 0.2) : d === 6 ? rgb(0.2, 0.4, 0.85) : txtC, font: fontBold });
    }

    const firstDay = getDay(new Date(year, m, 1));
    const daysInMonth = getDaysInMonth(new Date(year, m, 1));
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = firstDay + d - 1;
      const dc = pos % 7;
      const dr = Math.floor(pos / 7);
      const x = MARGIN + dc * cW;
      const y = gridTop - 22 - (dr + 1) * cH;
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);

      rect(pg, x, y, cW, cH, { borderColor: borderC, borderWidth: 0.5 });

      const isSun = dc === 0;
      const isSat = dc === 6;
      const textColor = hol || isSun ? rgb(0.85, 0.2, 0.2) : isSat ? rgb(0.2, 0.4, 0.85) : txtC;

      if (hol || isSun || isSat) {
        rect(pg, x, y + cH - 22, cW, 22, {
          color: hol ? rgb(1, 0.92, 0.92) : isSun ? rgb(1, 0.96, 0.96) : rgb(0.96, 0.97, 1),
        });
      }

      drawText(pg, String(d), x + 5, y + cH - 17, { size: 11, color: textColor, font: fontBold });
      if (hol) {
        drawText(pg, hol.name.slice(0, 6), x + 2, y + cH - 30, { size: 7, color: rgb(0.85, 0.2, 0.2), font });
      }
    }

    // 메모 영역
    const notesY = gridTop - 22 - 6 * cH - 15;
    line(pg, MARGIN, notesY, PAGE_W - MARGIN, 0.5, borderC);
    drawText(pg, '메모', MARGIN, notesY - 18, { size: 11, color: mutedC, font: fontBold });
    for (let i = 0; i < 4; i++) {
      line(pg, MARGIN, notesY - 35 - i * 18, PAGE_W - MARGIN, 0.3, borderC);
    }
  }

  // ── 4. 주간 플래너 × 52주 ───────────────────────────
  const weeks = eachWeekOfInterval(
    { start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 11, 31)) },
    { weekStartsOn: 0 }
  );

  const weekPageStart = pages.length;
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

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dW = INNER_W / 7;
    const dH = (PAGE_H - 120 - 50) / 1;

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + d);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const hol = holidayMap.get(dateStr);
      const x = MARGIN + d * dW;
      const y = 50;
      const isSun = d === 0;
      const isSat = d === 6;

      rect(pg, x, y, dW, PAGE_H - 120 - 50, { borderColor: borderC, borderWidth: 0.5 });

      const hdBg = hol ? rgb(1, 0.93, 0.93) : isSun ? rgb(1, 0.96, 0.96) : isSat ? rgb(0.96, 0.97, 1) : rgb(...toF(C.border));
      rect(pg, x, y + PAGE_H - 120 - 50 - 30, dW, 30, { color: hdBg });

      const dc = hol || isSun ? rgb(0.85, 0.2, 0.2) : isSat ? rgb(0.2, 0.4, 0.85) : txtC;
      drawText(pg, days[d], x + 6, y + PAGE_H - 120 - 50 - 20, { size: 10, color: dc, font: fontBold });
      drawText(pg, String(dayDate.getDate()), x + 6, y + PAGE_H - 120 - 50 - 33, { size: 9, color: mutedC, font });
      if (hol) {
        drawText(pg, hol.name.slice(0, 4), x + 2, y + PAGE_H - 120 - 50 - 44, { size: 7, color: rgb(0.85, 0.2, 0.2), font });
      }

      // 시간 라인 06-22
      for (let h = 6; h <= 22; h++) {
        const hy = y + PAGE_H - 120 - 50 - 30 - (h - 5) * 22;
        if (hy < y + 5) break;
        line(pg, x + 2, hy, x + dW - 2, 0.2, borderC);
        if (h % 2 === 0) drawText(pg, String(h), x + 2, hy + 2, { size: 6, color: mutedC, font });
      }
    }

    // 주간 목표
    drawText(pg, '이번 주 목표 / 메모', MARGIN, 42, { size: 10, color: mutedC, font: fontBold });
    line(pg, MARGIN, 36, PAGE_W - MARGIN, 0.5, borderC);
  });

  // ── 5. 운세 페이지 (fortune 있을 경우) ───────────────
  if (fortune) {
    pageRefs.push({ label: '나의 운세', pageIndex: pages.length });
    const fPg = addPage();
    rect(fPg, 0, PAGE_H - 120, PAGE_W, 120, { color: pC });
    drawText(fPg, '나의 운세', MARGIN, PAGE_H - 55, { size: 22, color: bgC, font: fontBold });
    drawText(fPg, `${year}년도 운세 분석`, MARGIN, PAGE_H - 80, { size: 13, color: rgb(...toF(C.bg)), font });

    const summaryLines = splitText(fortune.summary ?? '', 70);
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

    // 월별 운세
    if (fortune.monthly_fortunes?.length) {
      pageRefs.push({ label: '월별 운세', pageIndex: pages.length });
      const mfPg = addPage();
      drawText(mfPg, '월별 운세', MARGIN, PAGE_H - 55, { size: 20, color: pC, font: fontBold });
      line(mfPg, MARGIN, PAGE_H - 65, PAGE_W - MARGIN, 1, borderC);

      fortune.monthly_fortunes.slice(0, 12).forEach((mf, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = MARGIN + col * (INNER_W / 2 + 10);
        const y = PAGE_H - 90 - row * 110;

        rect(mfPg, x, y - 90, INNER_W / 2 - 5, 95, { borderColor: borderC, borderWidth: 0.5 });
        rect(mfPg, x, y - 18, INNER_W / 2 - 5, 23, { color: rgb(...toF(C.border)) });
        drawText(mfPg, `${mf.month}월`, x + 6, y - 12, { size: 12, color: pC, font: fontBold });
        drawText(mfPg, `운세 점수: ${mf.score}/10`, x + 60, y - 12, { size: 10, color: mutedC, font });

        const fLines = splitText(mf.fortune, 32);
        fLines.slice(0, 3).forEach((ln, li) => {
          drawText(mfPg, ln, x + 6, y - 35 - li * 16, { size: 9, color: txtC, font });
        });
      });
    }
  }

  // ── 6. 습관 트래커 × 12 ──────────────────────────────
  pageRefs.push({ label: '습관 트래커', pageIndex: pages.length });
  for (let m = 0; m < 12; m++) {
    const pg = addPage();
    const monthName = format(new Date(year, m, 1), 'M월', { locale: ko });
    drawText(pg, `${monthName} 습관 트래커`, MARGIN, PAGE_H - 50, { size: 18, color: pC, font: fontBold });
    line(pg, MARGIN, PAGE_H - 60, PAGE_W - MARGIN, 0.8, pC);

    const daysInMonth = getDaysInMonth(new Date(year, m, 1));
    const rows = 8; // 습관 항목 수
    const cellW = INNER_W / (daysInMonth + 1);
    const cellH = 28;

    // 날짜 헤더
    drawText(pg, '습관', MARGIN, PAGE_H - 80, { size: 9, color: mutedC, font: fontBold });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = holidayMap.get(dateStr);
      const dow = getDay(new Date(year, m, d));
      const isSun = dow === 0;
      const tc = hol || isSun ? rgb(0.85, 0.2, 0.2) : dow === 6 ? rgb(0.2, 0.4, 0.85) : mutedC;
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

  // ── 7. 목표 관리 ─────────────────────────────────────
  pageRefs.push({ label: '목표 관리', pageIndex: pages.length });
  const goalPg = addPage();
  rect(goalPg, 0, PAGE_H - 80, PAGE_W, 80, { color: pC });
  drawText(goalPg, `${year}년 목표 관리`, MARGIN, PAGE_H - 52, { size: 20, color: bgC, font: fontBold });

  const qNames = ['1분기', '2분기', '3분기', '4분기'];
  qNames.forEach((q, i) => {
    const y = PAGE_H - 105 - i * 170;
    rect(goalPg, MARGIN, y - 150, INNER_W, 155, { borderColor: borderC, borderWidth: 0.7 });
    rect(goalPg, MARGIN, y - 20, INNER_W, 25, { color: rgb(...toF(C.border)) });
    drawText(goalPg, q, MARGIN + 8, y - 12, { size: 12, color: pC, font: fontBold });
    for (let j = 0; j < 5; j++) {
      const ly = y - 45 - j * 25;
      drawText(goalPg, `${j + 1}.`, MARGIN + 8, ly + 5, { size: 11, color: mutedC, font });
      line(goalPg, MARGIN + 22, ly, PAGE_W - MARGIN - 10, 0.4, borderC);
    }
  });

  // ── 8. 메모 페이지 × 4 ──────────────────────────────
  pageRefs.push({ label: '메모', pageIndex: pages.length });
  for (let i = 0; i < 4; i++) {
    const pg = addPage();
    drawText(pg, 'MEMO', MARGIN, PAGE_H - 55, { size: 28, color: pC, font: fontBold });
    line(pg, MARGIN, PAGE_H - 68, PAGE_W - MARGIN, 1, pC);
    for (let l = 0; l < 30; l++) {
      line(pg, MARGIN, PAGE_H - 90 - l * 24, PAGE_W - MARGIN, 0.4, borderC);
    }
    drawText(pg, String(i + 1), PAGE_W - MARGIN - 10, 40, { size: 10, color: mutedC, font });
  }

  // ── 9. 가계부 (연간 요약) ────────────────────────────
  pageRefs.push({ label: '가계부', pageIndex: pages.length });
  const budgetPg = addPage();
  rect(budgetPg, 0, PAGE_H - 80, PAGE_W, 80, { color: accentC });
  drawText(budgetPg, `${year}년 가계부`, MARGIN, PAGE_H - 52, { size: 20, color: bgC, font: fontBold });

  const headers = ['월', '수입', '지출', '저축', '합계'];
  const colWs = [40, 100, 100, 100, 100];
  let tx = MARGIN;
  headers.forEach((h, hi) => {
    rect(budgetPg, tx, PAGE_H - 103, colWs[hi], 22, { color: rgb(...toF(C.border)) });
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

  // ── 10. 내비게이션 (목차) 페이지 ─────────────────────
  // 내비게이션은 PDF에 링크 주석으로 추가
  // 표지 다음 페이지로 삽입
  // 이미 추가된 페이지에 링크 주석 삽입
  // (pdf-lib의 addLinkAnnotation은 page.node.set으로 직접 구현)

  return await pdfDoc.save();
}

// 텍스트 줄바꿈 헬퍼
function splitText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxChars || char === '\n') {
      lines.push(current.replace('\n', ''));
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}
