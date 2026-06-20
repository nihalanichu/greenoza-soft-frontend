import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { loginRequest, setAuthToken } from '../api';
import type { User } from '../types';

const STORAGE_KEY = 'fruit-market-token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadUser = useCallback(async (savedToken: string) => {
    try {
      setAuthToken(savedToken);
      const { data } = await api.get<User>('/me');
      setUser(data);
      setToken(savedToken);
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      void loadUser(savedToken);
    }
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    const { token: newToken, user: loggedUser } = response.data;
    localStorage.setItem(STORAGE_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore logout errors
    }

    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
