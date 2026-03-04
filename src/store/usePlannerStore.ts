import { create } from 'zustand';
import { getPlannerYear } from '@/lib/holidays';
import type { FortuneResult } from '@/types';

interface PlannerStoreState {
  // 현재 플래너 연도 (11월 1일 자동 변경)
  plannerYear: number;

  // PDF 생성 상태
  isGenerating: boolean;
  generationProgress: number;  // 0-100
  lastGeneratedUrl: string | null;

  // 운세 데이터 (생성된 플래너에 포함될)
  fortuneData: FortuneResult | null;
  setFortuneData: (data: FortuneResult | null) => void;

  // PDF 생성 액션
  setGenerating: (v: boolean) => void;
  setProgress: (v: number) => void;
  setGeneratedUrl: (url: string | null) => void;

  // 연도 갱신
  refreshYear: () => void;
}

export const usePlannerStore = create<PlannerStoreState>()((set) => ({
  plannerYear: getPlannerYear(),
  isGenerating: false,
  generationProgress: 0,
  lastGeneratedUrl: null,
  fortuneData: null,

  setFortuneData: (data) => set({ fortuneData: data }),
  setGenerating: (v) => set({ isGenerating: v }),
  setProgress: (v) => set({ generationProgress: v }),
  setGeneratedUrl: (url) => set({ lastGeneratedUrl: url }),
  refreshYear: () => set({ plannerYear: getPlannerYear() }),
}));
