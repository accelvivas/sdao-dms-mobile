import { AppState, Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type * as Notifications from 'expo-notifications';

import { apiClient } from '../api/client';
import { config } from '../constants/config';

const DEVICE_ID_KEY = 'sdao_push_device_id';
const EXPO_PUSH_TOKEN_KEY = 'sdao_expo_push_token';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

type NotificationsModule = typeof import('expo-notifications');
type NotificationSubscription = { remove: () => void };
type NotificationHandler = (notification: Notifications.Notification) => void;
type NotificationResponseHandler = (response: Notifications.NotificationResponse) => void;

let notificationsModule: NotificationsModule | null = null;

function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo'
    || (Constants.expoGoConfig !== null && Constants.expoGoConfig !== undefined);
}

function getNotificationsModule(): NotificationsModule | null {
  if (
    !config.notificationsEnabled
    || config.useMockData
    || Platform.OS === 'web'
    || isRunningInExpoGo()
  ) return null;

  if (!notificationsModule) {
    notificationsModule = require('expo-notifications') as NotificationsModule;
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  return notificationsModule;
}

async function getStableDeviceId(): Promise<string> {
  const storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY, SECURE_STORE_OPTIONS);
  if (storedId) return storedId;

  const deviceId = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, SECURE_STORE_OPTIONS);
  return deviceId;
}

function getEasProjectId(): string | undefined {
  return Constants.easConfig?.projectId
    ?? Constants.expoConfig?.extra?.eas?.projectId
    ?? undefined;
}

export async function registerPushToken(
  devicePushToken?: Notifications.DevicePushToken,
): Promise<void> {
  const notifications = getNotificationsModule();
  if (!notifications) return;

  try {
    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync('reviews', {
        name: 'Proposal reviews',
        importance: notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#164E63',
      });
    }

    const currentPermissions = await notifications.getPermissionsAsync();
    const permissions = currentPermissions.granted
      ? currentPermissions
      : await notifications.requestPermissionsAsync();
    const isIosProvisional = permissions.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!permissions.granted && !isIosProvisional) return;

    const projectId = getEasProjectId();
    if (!projectId) {
      console.warn('Push registration skipped: configure EAS projectId in app.config.js.');
      return;
    }

    const tokenResult = await notifications.getExpoPushTokenAsync({
      projectId,
      ...(devicePushToken ? { devicePushToken } : {}),
    });
    const deviceId = await getStableDeviceId();

    await apiClient.post('/mobile/push-tokens', {
      token: tokenResult.data,
      device_id: deviceId,
      platform: Platform.OS,
      device_name: Device.deviceName ?? 'SDAO DMS Mobile',
    });
    await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, tokenResult.data, SECURE_STORE_OPTIONS);
  } catch (error) {
    console.warn(
      'Push-token registration failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

export function addPushTokenRefreshListener(): NotificationSubscription | null {
  if (
    !config.notificationsEnabled
    || config.useMockData
    || Platform.OS === 'web'
    || isRunningInExpoGo()
  ) return null;

  return AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void registerPushToken();
    }
  });
}

export function addNotificationResponseListener(
  handler: NotificationResponseHandler,
): NotificationSubscription | null {
  return getNotificationsModule()?.addNotificationResponseReceivedListener(handler) ?? null;
}

export function addNotificationReceivedListener(
  handler: NotificationHandler,
): NotificationSubscription | null {
  return getNotificationsModule()?.addNotificationReceivedListener(handler) ?? null;
}

export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await getNotificationsModule()?.getLastNotificationResponseAsync() ?? null;
}

export async function clearLastNotificationResponse(): Promise<void> {
  await getNotificationsModule()?.clearLastNotificationResponseAsync();
}

export async function unregisterPushToken(): Promise<void> {
  const [token, deviceId] = await Promise.all([
    SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY, SECURE_STORE_OPTIONS),
    SecureStore.getItemAsync(DEVICE_ID_KEY, SECURE_STORE_OPTIONS),
  ]);

  if (!token || !deviceId) return;

  try {
    await apiClient.delete('/mobile/push-tokens', {
      data: { token, device_id: deviceId },
    });
    await SecureStore.deleteItemAsync(EXPO_PUSH_TOKEN_KEY, SECURE_STORE_OPTIONS);
  } catch (error) {
    console.warn(
      'Push-token unregistration failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
