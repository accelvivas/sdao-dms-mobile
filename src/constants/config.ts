import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

function requireHttpsUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('API_BASE_URL must be a valid HTTPS URL.');
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('API_BASE_URL must use HTTPS and must not contain credentials.');
  }

  return value.replace(/\/+$/, '');
}

const apiBaseUrl = (extra.apiBaseUrl as string | undefined) ?? 'https://example.invalid/api';

export const config = {
  apiBaseUrl: requireHttpsUrl(apiBaseUrl),
  supabaseUrl: (extra.supabaseUrl as string | undefined) ?? '',
  supabaseAnonKey: (extra.supabaseAnonKey as string | undefined) ?? '',
  notificationsEnabled: extra.notificationsEnabled !== false,
  pushNotificationsEnabled: extra.pushNotificationsEnabled === true,
  useMockData: false,
  mockDelayMs: 500,
  mockNetworkError: false,
};
