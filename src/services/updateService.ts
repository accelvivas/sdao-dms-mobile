import * as Updates from 'expo-updates';

export async function applyAvailableSecurityUpdate(): Promise<boolean> {
  if (__DEV__ || !Updates.isEnabled) {
    return false;
  }

  const update = await Updates.checkForUpdateAsync();
  if (!update.isAvailable) {
    return false;
  }

  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
  return true;
}
