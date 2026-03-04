import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, setToken, clearToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<string | null>;
  register: (data: { email: string; password: string; name: string }) => Promise<string | null>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const res = await authApi.login(email, password);
        set({ isLoading: false });
        if (res.ok && res.data) {
          set({ user: res.data.user, token: res.data.token });
          setToken(res.data.token);
          return null;
        }
        return res.error ?? '로그인에 실패했습니다.';
      },

      register: async (data) => {
        set({ isLoading: true });
        const res = await authApi.register(data);
        set({ isLoading: false });
        if (res.ok && res.data) {
          set({ user: res.data.user, token: res.data.token });
          setToken(res.data.token);
          return null;
        }
        return res.error ?? '회원가입에 실패했습니다.';
      },

      logout: () => {
        authApi.logout();
        set({ user: null, token: null });
        clearToken();
      },

      fetchMe: async () => {
        if (!get().token) return;
        const res = await authApi.me();
        if (res.ok && res.data) {
          set({ user: res.data });
        } else {
          set({ user: null, token: null });
          clearToken();
        }
      },
    }),
    { name: 'planner-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

export const isAdmin = () => useAuthStore.getState().user?.role === 'admin';
export const isPremium = () => {
  const u = useAuthStore.getState().user;
  return u?.plan === 'premium' || u?.role === 'admin';
};
