import { create } from 'zustand';
import { profileApi } from '@/lib/api';
import type { UserProfile } from '@/types';
import { registerProfileClear } from '@/store/useAuthStore';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  lastFetched: number | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile & Record<string, unknown>>) => Promise<string | null>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  lastFetched: null,

  fetchProfile: async () => {
    const now = Date.now();
    // 5분 캐시
    if (get().lastFetched && now - (get().lastFetched ?? 0) < 5 * 60 * 1000) return;
    set({ isLoading: true });
    const res = await profileApi.get();
    if (res.ok && res.data) {
      set({ profile: res.data, lastFetched: now });
    }
    set({ isLoading: false });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    const res = await profileApi.update(data as Parameters<typeof profileApi.update>[0]);
    set({ isLoading: false });
    if (!res.ok) return res.error ?? '저장 실패';
    // 캐시 무효화
    set({ lastFetched: null });
    await get().fetchProfile();
    return null;
  },

  clearProfile: () => set({ profile: null, lastFetched: null }),
}));

// 로그인/로그아웃 시 프로파일 캐시 자동 클리어 등록
registerProfileClear(() => useProfileStore.getState().clearProfile());
