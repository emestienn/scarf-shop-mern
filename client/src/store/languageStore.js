import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { t as translate } from '../i18n/index.js';

const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
      t: (key) => translate(get().lang, key),
    }),
    { name: 'lp-lang' }
  )
);

export default useLanguageStore;
