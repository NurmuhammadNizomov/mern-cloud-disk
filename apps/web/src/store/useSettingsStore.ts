import { create } from 'zustand';
import { Language, translations } from '../i18n/translations';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface SettingsState {
  theme: 'light' | 'dark';
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const savedTheme = (storage.get(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  const savedLang = (storage.get(STORAGE_KEYS.LANGUAGE) as Language) || 'en'; // default en

  // Apply initial theme to document root
  document.documentElement.setAttribute('data-theme', savedTheme);

  return {
    theme: savedTheme,
    language: savedLang,
    t: translations[savedLang] || translations.en,

    toggleTheme: () => {
      const newTheme = get().theme === 'light' ? 'dark' : 'light';
      storage.set(STORAGE_KEYS.THEME, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      set({ theme: newTheme });
    },

    setLanguage: (language: Language) => {
      storage.set(STORAGE_KEYS.LANGUAGE, language);
      set({
        language,
        t: translations[language] || translations.en
      });
    }
  };
});
