import type { PDFTemplate, TemplateColors } from '@/types';

// ============================================================
// PDF 디자인 템플릿 정의
// ============================================================

const TEMPLATES: Record<string, PDFTemplate> = {
  minimal: {
    key: 'minimal',
    name: '미니멀',
    colors: {
      primary:   [30, 30, 30],
      secondary: [90, 90, 90],
      accent:    [60, 60, 60],
      bg:        [255, 255, 255],
      text:      [20, 20, 20],
      muted:     [160, 160, 160],
      border:    [220, 220, 220],
    },
  },
  colorful: {
    key: 'colorful',
    name: '컬러풀',
    colors: {
      primary:   [255, 145, 162],
      secondary: [162, 210, 255],
      accent:    [255, 214, 102],
      bg:        [255, 252, 250],
      text:      [40, 40, 40],
      muted:     [180, 160, 160],
      border:    [255, 200, 210],
    },
  },
  dark: {
    key: 'dark',
    name: '다크',
    colors: {
      primary:   [100, 180, 255],
      secondary: [80, 220, 190],
      accent:    [255, 200, 80],
      bg:        [22, 22, 30],
      text:      [240, 240, 245],
      muted:     [100, 100, 120],
      border:    [50, 50, 65],
    },
  },
  nature: {
    key: 'nature',
    name: '자연',
    colors: {
      primary:   [76, 140, 74],
      secondary: [140, 180, 80],
      accent:    [200, 160, 80],
      bg:        [250, 252, 248],
      text:      [30, 50, 30],
      muted:     [150, 170, 130],
      border:    [200, 220, 190],
    },
  },
  classic: {
    key: 'classic',
    name: '클래식',
    colors: {
      primary:   [120, 80, 40],
      secondary: [160, 120, 70],
      accent:    [80, 100, 140],
      bg:        [252, 248, 240],
      text:      [40, 30, 20],
      muted:     [180, 160, 130],
      border:    [210, 190, 160],
    },
  },
  premium_all: {
    key: 'premium_all',
    name: '프리미엄',
    colors: {
      primary:   [30, 80, 180],
      secondary: [60, 140, 220],
      accent:    [220, 160, 30],
      bg:        [250, 252, 255],
      text:      [15, 25, 50],
      muted:     [130, 150, 180],
      border:    [200, 215, 235],
    },
  },
  saju: {
    key: 'saju',
    name: '사주',
    colors: {
      primary:   [140, 40, 40],
      secondary: [200, 80, 50],
      accent:    [220, 180, 60],
      bg:        [252, 248, 240],
      text:      [40, 20, 20],
      muted:     [170, 130, 110],
      border:    [220, 190, 170],
    },
  },
  astrology: {
    key: 'astrology',
    name: '점성술',
    colors: {
      primary:   [60, 30, 120],
      secondary: [100, 60, 180],
      accent:    [220, 200, 60],
      bg:        [12, 8, 30],
      text:      [230, 225, 255],
      muted:     [120, 100, 160],
      border:    [60, 50, 100],
    },
  },
  couple: {
    key: 'couple',
    name: '커플',
    colors: {
      primary:   [220, 80, 120],
      secondary: [255, 160, 180],
      accent:    [255, 200, 100],
      bg:        [255, 248, 250],
      text:      [60, 20, 40],
      muted:     [200, 160, 170],
      border:    [255, 210, 220],
    },
  },
  business: {
    key: 'business',
    name: '비즈니스',
    colors: {
      primary:   [20, 60, 100],
      secondary: [40, 100, 160],
      accent:    [180, 130, 30],
      bg:        [248, 250, 252],
      text:      [15, 30, 50],
      muted:     [120, 140, 160],
      border:    [200, 215, 230],
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
