import type { PDFTemplate, TemplateColors } from '@/types';

// ============================================================
// PDF 디자인 템플릿 정의 (10종 정제 팔레트)
// ============================================================

const TEMPLATES: Record<string, PDFTemplate> = {
  // ── 모노크롬 차콜 ─────────────────────────────────────────
  minimal: {
    key: 'minimal',
    name: '미니멀',
    colors: {
      primary:   [28,  28,  35],
      secondary: [72,  72,  85],
      accent:    [99,  102, 241],
      bg:        [255, 255, 255],
      text:      [15,  15,  20],
      muted:     [152, 152, 165],
      border:    [224, 224, 232],
    },
  },
  // ── 선셋 파스텔 ──────────────────────────────────────────
  colorful: {
    key: 'colorful',
    name: '컬러풀',
    colors: {
      primary:   [248, 113, 113],
      secondary: [139, 92,  246],
      accent:    [251, 191, 36],
      bg:        [255, 253, 251],
      text:      [36,  18,  38],
      muted:     [174, 148, 162],
      border:    [254, 213, 213],
    },
  },
  // ── 미드나이트 카본 ───────────────────────────────────────
  dark: {
    key: 'dark',
    name: '다크',
    colors: {
      primary:   [96,  165, 250],
      secondary: [52,  211, 153],
      accent:    [251, 191, 36],
      bg:        [14,  16,  26],
      text:      [236, 236, 246],
      muted:     [96,  100, 130],
      border:    [36,  40,  58],
    },
  },
  // ── 포레스트 세이지 ───────────────────────────────────────
  nature: {
    key: 'nature',
    name: '자연',
    colors: {
      primary:   [47,  115, 74],
      secondary: [116, 162, 68],
      accent:    [183, 132, 46],
      bg:        [247, 252, 244],
      text:      [18,  42,  22],
      muted:     [128, 162, 108],
      border:    [188, 218, 172],
    },
  },
  // ── 에이지드 파치먼트 ─────────────────────────────────────
  classic: {
    key: 'classic',
    name: '클래식',
    colors: {
      primary:   [101, 66,  32],
      secondary: [148, 108, 56],
      accent:    [64,  90,  135],
      bg:        [254, 248, 236],
      text:      [38,  26,  12],
      muted:     [168, 142, 110],
      border:    [220, 196, 158],
    },
  },
  // ── 로얄 네이비 ──────────────────────────────────────────
  premium_all: {
    key: 'premium_all',
    name: '프리미엄',
    colors: {
      primary:   [22,  56,  168],
      secondary: [56,  128, 248],
      accent:    [214, 158, 26],
      bg:        [248, 251, 255],
      text:      [8,   18,  50],
      muted:     [118, 142, 180],
      border:    [195, 212, 240],
    },
  },
  // ── 버밀리온 & 골드 (한국 전통 단청) ─────────────────────
  saju: {
    key: 'saju',
    name: '사주',
    colors: {
      primary:   [168, 22,  26],
      secondary: [196, 70,  44],
      accent:    [214, 166, 40],
      bg:        [253, 248, 238],
      text:      [40,  12,  12],
      muted:     [170, 118, 96],
      border:    [230, 190, 164],
    },
  },
  // ── 미드나이트 갤럭시 ─────────────────────────────────────
  astrology: {
    key: 'astrology',
    name: '점성술',
    colors: {
      primary:   [138, 43,  226],
      secondary: [72,  50,  172],
      accent:    [255, 215, 0],
      bg:        [10,  6,   28],
      text:      [228, 222, 255],
      muted:     [110, 88,  162],
      border:    [50,  40,  96],
    },
  },
  // ── 로즈 가든 ────────────────────────────────────────────
  couple: {
    key: 'couple',
    name: '커플',
    colors: {
      primary:   [214, 60,  110],
      secondary: [248, 140, 166],
      accent:    [255, 192, 78],
      bg:        [255, 247, 249],
      text:      [60,  16,  36],
      muted:     [196, 150, 162],
      border:    [254, 202, 216],
    },
  },
  // ── 이그제큐티브 네이비 ───────────────────────────────────
  business: {
    key: 'business',
    name: '비즈니스',
    colors: {
      primary:   [14,  46,  96],
      secondary: [28,  88,  160],
      accent:    [198, 144, 18],
      bg:        [247, 250, 253],
      text:      [8,   22,  48],
      muted:     [106, 130, 158],
      border:    [196, 214, 234],
    },
  },
};

export function getTemplate(key: string): PDFTemplate {
  return TEMPLATES[key] ?? TEMPLATES.minimal;
}

export function getAllTemplates(): PDFTemplate[] {
  return Object.values(TEMPLATES);
}

// rgb 배열 → CSS 색상 문자열 (미리보기용)
export function toCssColor(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// rgb 배열 → 0-1 범위 (pdf-lib용)
export function toF(rgb: [number, number, number]): [number, number, number] {
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}
