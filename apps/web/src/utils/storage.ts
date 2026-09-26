export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'disk_access_token',
  REFRESH_TOKEN: 'disk_refresh_token',
  THEME: 'disk_theme',
  LANGUAGE: 'disk_language'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const storage = {
  get: <T = string>(key: StorageKey, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;
      return item as unknown as T;
    } catch (error) {
      console.warn(`[storage] Error reading key "${key}":`, error);
      return defaultValue ?? null;
    }
  },

  set: (key: StorageKey, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[storage] Error setting key "${key}":`, error);
    }
  },

  remove: (key: StorageKey): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] Error removing key "${key}":`, error);
    }
  },

  clearAuth: (): void => {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }
};
