import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

import { apiClient, setMobileToken } from '../api/client';
import { config } from '../constants/config';
import {
  getMockAccount,
  getMockToken,
  getMockUser,
  getMockUserByToken,
} from '../mocks/mockAuth';
import { throwMockNetworkError, waitForMockResponse } from '../mocks/mockUtils';
import type {
  LoginCredentials,
  LoginResult,
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
  mobile_access?: boolean;
  capabilities?: {
    can_access_mobile_review?: boolean;
  };
};

type LoginResponse = {
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
    roleAssignments: roles.map((role) => ({
      role: role as User['roleAssignments'][number]['role'],
      label: role,
    })),
    mobileAccess:
      payload.mobile_access ?? payload.capabilities?.can_access_mobile_review ?? false,
  };
}

export class MobileAccessDeniedError extends Error {
  constructor() {
    super(
      'This mobile application is available only to authorized Activity Proposal approvers.',
    );
    this.name = 'MobileAccessDeniedError';
  }
}

function assertMobileAccess(user: User): User {
  if (!user.mobileAccess) {
    throw new MobileAccessDeniedError();
  }
  return user;
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

  if (error instanceof Error && error.message) {
    return error.message;
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
  try {
    return await fetchAuthenticatedUser();
  } catch (error) {
    await clearMobileToken();
    throw error;
  }
}

export async function fetchAuthenticatedUser(): Promise<User> {
  if (config.useMockData) {
    const token = await SecureStore.getItemAsync(
      MOBILE_TOKEN_KEY,
      SECURE_STORE_OPTIONS,
    );
    const user = token ? getMockUserByToken(token) : null;
    if (!user) {
      throw new Error('The mock session is no longer available.');
    }
    return assertMobileAccess(user);
  }

  const { data } = await apiClient.get<LaravelUserPayload>('/mobile/user');
  return assertMobileAccess(normalizeUser(data));
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    const account = getMockAccount(credentials);
    const user = assertMobileAccess(getMockUser(account));

    await persistMobileToken(getMockToken(user));
    return { user };
  }

  const { data } = await apiClient.post<LoginResponse>('/mobile/login', {
    email: credentials.email,
    password: credentials.password,
    device_name: Device.deviceName ?? 'SDAO DMS Mobile',
  });

  const user = await completeAuthenticatedSession(data.token);
  assertMobileAccess(user);
  return { user };
}

export async function logout(): Promise<void> {
  if (config.useMockData) {
    await waitForMockResponse();
    await clearMobileToken();
    return;
  }

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

export async function getCurrentUser(): Promise<User | null> {
  return restoreSession();
}
