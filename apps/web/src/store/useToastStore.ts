import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  clearAll: () => set({ toasts: [] })
}));

export const toast = {
  success: (message: string, title?: string, duration = 3500) =>
    useToastStore.getState().addToast({ type: 'success', message, title, duration }),
  error: (message: string, title?: string, duration = 4500) =>
    useToastStore.getState().addToast({ type: 'error', message, title, duration }),
  info: (message: string, title?: string, duration = 3500) =>
    useToastStore.getState().addToast({ type: 'info', message, title, duration }),
  warning: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'warning', message, title, duration }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id)
};
