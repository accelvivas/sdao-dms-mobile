import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

import { apiClient, setMobileToken } from '../api/client';
import type {
  LoginCredentials,
  LoginResult,
  TwoFactorChallenge,
  User,
} from '../types/auth';

const MOBILE_TOKEN_KEY = 'sdao_mobile_api_token';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

type RolePayload = string | { name: string };

type LaravelUserPayload = {
  id: number | string;
  email: string;
  name: string;
  roles?: RolePayload[];
};

type LoginResponse = {
  token?: string;
  two_factor?: boolean;
  two_factor_challenge_token?: string;
  user?: LaravelUserPayload;
};

type TwoFactorResponse = {
  token: string;
};

function normalizeUser(payload: LaravelUserPayload): User {
  const roles = (payload.roles ?? []).flatMap((role) => {
    if (typeof role === 'string') {
      return [role];
    }
    return role.name ? [role.name] : [];
  });

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    roles,
  };
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    const firstFieldError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    if (firstFieldError) {
      return firstFieldError;
    }

    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }

    if (error.response?.status === 401) {
      return 'These credentials do not match our records.';
    }

    if (error.response?.status === 403) {
      return 'This account is not allowed to sign in.';
    }
  }

  return 'Unable to sign in. Please try again.';
}

async function persistMobileToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(MOBILE_TOKEN_KEY, token, SECURE_STORE_OPTIONS);
  setMobileToken(token);
}

export async function clearMobileToken(): Promise<void> {
  setMobileToken(null);
  await SecureStore.deleteItemAsync(MOBILE_TOKEN_KEY, SECURE_STORE_OPTIONS);
}

export async function restoreMobileToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(
    MOBILE_TOKEN_KEY,
    SECURE_STORE_OPTIONS,
  );
  setMobileToken(token);
  return token;
}

async function completeAuthenticatedSession(token: string): Promise<User> {
  await persistMobileToken(token);
  return fetchAuthenticatedUser();
}

export async function fetchAuthenticatedUser(): Promise<User> {
  const { data } = await apiClient.get<LaravelUserPayload>('/mobile/user');
  return normalizeUser(data);
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResponse>('/mobile/login', {
    email: credentials.email,
    password: credentials.password,
    device_name: Device.deviceName ?? 'SDAO DMS Mobile',
  });

  if (data.two_factor) {
    if (!data.two_factor_challenge_token) {
      throw new Error('Two-factor challenge is missing.');
    }

    return {
      requiresTwoFactor: true,
      challengeToken: data.two_factor_challenge_token,
    };
  }

  if (!data.token) {
    throw new Error('Mobile API token was not issued.');
  }

  const user = await completeAuthenticatedSession(data.token);
  return { requiresTwoFactor: false, user };
}

export async function verifyTwoFactor(
  payload: TwoFactorChallenge,
): Promise<User> {
  const { data } = await apiClient.post<TwoFactorResponse>('/mobile/two-factor', {
    email: payload.email,
    code: payload.code,
    two_factor_challenge_token: payload.challengeToken,
    device_name: Device.deviceName ?? 'SDAO DMS Mobile',
  });

  return completeAuthenticatedSession(data.token);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/mobile/logout');
  } catch {
    // Always clear the local token so the device cannot keep a revoked session.
  } finally {
    await clearMobileToken();
  }
}

export async function restoreSession(): Promise<User | null> {
  const token = await restoreMobileToken();
  if (!token) {
    return null;
  }

  try {
    return await fetchAuthenticatedUser();
  } catch {
    await clearMobileToken();
    return null;
  }
}
