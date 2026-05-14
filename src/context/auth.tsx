import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/database';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getCurrentUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    const result = authService.login(email);
    if (result) {
      setUser(result);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials. Try alex@company.io' };
  };

  const signup = async (name: string, email: string, _password: string) => {
    const result = authService.signup(name, email);
    if (result) {
      setUser(result);
      return { ok: true };
    }
    return { ok: false, error: 'Email already registered' };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
