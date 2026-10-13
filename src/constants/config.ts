import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

function requireHttpsUrl(value: string, name: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${name} must use HTTPS and must not contain credentials.`);
  }

  return value.replace(/\/+$/, '');
}

const apiBaseUrl = (extra.apiBaseUrl as string | undefined) ?? 'https://example.invalid/api';
const webSystemUrl = (extra.webSystemUrl as string | undefined) ?? 'https://nulpsdao.com';

export const config = {
  apiBaseUrl: requireHttpsUrl(apiBaseUrl, 'API_BASE_URL'),
  webSystemUrl: requireHttpsUrl(webSystemUrl, 'WEB_SYSTEM_URL'),
  supabaseUrl: (extra.supabaseUrl as string | undefined) ?? '',
  supabaseAnonKey: (extra.supabaseAnonKey as string | undefined) ?? '',
  notificationsEnabled: extra.notificationsEnabled !== false,
  pushNotificationsEnabled: extra.pushNotificationsEnabled === true,
  useMockData: false,
  mockDelayMs: 500,
  mockNetworkError: false,
};
