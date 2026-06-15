import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/index.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => !!get().token,
      isWholesale: () => ['wholesale', 'admin'].includes(get().user?.role),
      isAdmin: () => get().user?.role === 'admin',

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      telegramLogin: async (telegramData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/telegram', telegramData);
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Telegram login failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        delete api.defaults.headers.common['Authorization'];
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.put('/auth/profile', profileData);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Update failed';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'lp-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
