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
} from '../services/authService';
import {
  addPushTokenRefreshListener,
  registerPushToken,
  unregisterPushToken,
} from '../services/pushNotificationService';
import type { LoginCredentials, LoginResult, User } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  hasAcceptedPrivacyNotice: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  acceptPrivacyNotice: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcceptedPrivacyNotice, setHasAcceptedPrivacyNotice] = useState(false);

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

  useEffect(() => {
    if (!user || !hasAcceptedPrivacyNotice) return;

    void registerPushToken();
    const tokenSubscription = addPushTokenRefreshListener();
    return () => tokenSubscription?.remove();
  }, [hasAcceptedPrivacyNotice, user?.id]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginRequest(credentials);

    setHasAcceptedPrivacyNotice(false);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await unregisterPushToken();
    await logoutRequest();
    setHasAcceptedPrivacyNotice(false);
    setUser(null);
  }, []);

  const acceptPrivacyNotice = useCallback(() => {
    setHasAcceptedPrivacyNotice(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      hasAcceptedPrivacyNotice,
      login,
      logout,
      acceptPrivacyNotice,
    }),
    [user, isLoading, hasAcceptedPrivacyNotice, login, logout, acceptPrivacyNotice],
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
