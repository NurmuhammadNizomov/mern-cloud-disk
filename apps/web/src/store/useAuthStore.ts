import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/client';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storage.get(STORAGE_KEYS.ACCESS_TOKEN),
  loading: true,

  fetchMe: async () => {
    try {
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        set({ user: null, loading: false });
        return;
      }
      const res = await authApi.getMe();
      set({ user: res.user, loading: false });
    } catch (error) {
      console.error('fetchMe error:', error);
      storage.clearAuth();
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = res;
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ token: accessToken, user });
  },

  register: async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    const { accessToken, refreshToken, user } = res;
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ token: accessToken, user });
  },

  logout: () => {
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN) || undefined;
    authApi.logout(refreshToken).catch(() => {});
    storage.clearAuth();
    set({ user: null, token: null });
  }
}));
