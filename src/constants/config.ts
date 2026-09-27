import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const config = {
  apiBaseUrl: (extra.apiBaseUrl as string | undefined) ?? 'https://example.invalid/api',
  supabaseUrl: (extra.supabaseUrl as string | undefined) ?? '',
  supabaseAnonKey: (extra.supabaseAnonKey as string | undefined) ?? '',
  useMockData: false,
  mockDelayMs: 500,
  mockNetworkError: false,
};
