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
  login as loginRequest,
  logout as logoutRequest,
  restoreSession,
  verifyTwoFactor,
} from '../services/authService';
import type {
  LoginCredentials,
  LoginNeedsTwoFactor,
  LoginResult,
  TwoFactorChallenge,
  User,
} from '../types/auth';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  confirmTwoFactor: (payload: TwoFactorChallenge) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    restoreSession()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
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
      setUser(result.user);
    }

    return result;
  }, []);

  const confirmTwoFactor = useCallback(async (payload: TwoFactorChallenge) => {
    const authenticatedUser = await verifyTwoFactor(payload);
    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
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

export function isTwoFactorRequired(
  result: LoginResult,
): result is LoginNeedsTwoFactor {
  return result.requiresTwoFactor;
}
