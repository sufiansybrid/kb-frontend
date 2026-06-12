import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const storedToken = localStorage.getItem('kb_token');
const storedUser = localStorage.getItem('kb_user');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('kb_token', token);
    localStorage.setItem('kb_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('kb_token');
    localStorage.removeItem('kb_user');
    set({ user: null, token: null });
  },

  isAdmin: () => get().user?.role === 'admin',
}));
