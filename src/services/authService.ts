import * as SecureStore from 'expo-secure-store';

import { apiClient } from '../api/client';
import type {
  LoginCredentials,
  Session,
  TwoFactorPayload,
  User,
} from '../types/auth';

const TOKEN_KEY = 'sdao_access_token';

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, session.accessToken);
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function login(
  credentials: LoginCredentials,
): Promise<{ user: User; session: Session; requiresTwoFactor: boolean }> {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
}

export async function verifyTwoFactor(
  payload: TwoFactorPayload,
): Promise<{ user: User; session: Session }> {
  const { data } = await apiClient.post('/auth/2fa', payload);
  return data;
}

export async function logout(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getStoredToken();
  if (!token) {
    return null;
  }

  const { data } = await apiClient.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
