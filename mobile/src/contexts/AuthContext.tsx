import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as authApi from '../api/auth';
import { tokenStore } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const access = await tokenStore.getAccess();
    if (!access) { setUser(null); return; }
    const me = await authApi.me();
    setUser(me);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login: async (email, password) => {
      const { user } = await authApi.login(email, password);
      setUser(user);
    },
    register: async (input) => {
      await authApi.register(input);
      await value.login(input.email, input.password);
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
    },
    refresh,
    setUser,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, loading, refresh]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
