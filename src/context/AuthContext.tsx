import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearSession,
  getCurrentUser,
  login as loginRequest,
  saveSession,
  verifyTwoFactor,
} from '../services/authService';
import type { LoginCredentials, TwoFactorPayload, User } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ requiresTwoFactor: boolean }>;
  confirmTwoFactor: (payload: TwoFactorPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginRequest(credentials);
    if (!result.requiresTwoFactor) {
      await saveSession(result.session);
      setUser(result.user);
    }
    return { requiresTwoFactor: result.requiresTwoFactor };
  }, []);

  const confirmTwoFactor = useCallback(async (payload: TwoFactorPayload) => {
    const result = await verifyTwoFactor(payload);
    await saveSession(result.session);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, confirmTwoFactor, logout }),
    [user, isLoading, login, confirmTwoFactor, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
