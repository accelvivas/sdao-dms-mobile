import * as LocalAuthentication from 'expo-local-authentication';

export type SensitiveActionAuthenticationResult =
  | { success: true }
  | { success: false; message: string };

export async function authenticateSensitiveAction(
  actionLabel: string,
): Promise<SensitiveActionAuthenticationResult> {
  const [hasHardware, isEnrolled, enrolledLevel] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
  ]);

  if (
    !hasHardware
    || !isEnrolled
    || enrolledLevel < LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
  ) {
    return {
      success: false,
      message: 'Enroll a strong fingerprint or face unlock in the device settings before performing proposal actions.',
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Confirm ${actionLabel}`,
    promptSubtitle: 'SDAO DMS security verification',
    promptDescription: 'Verify your identity before submitting this proposal action.',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use device passcode',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
    requireConfirmation: true,
  });

  if (result.success) {
    return { success: true };
  }

  const cancelledErrors = new Set(['user_cancel', 'app_cancel', 'system_cancel']);
  return {
    success: false,
    message: cancelledErrors.has(result.error)
      ? 'Identity confirmation was cancelled. No proposal action was submitted.'
      : 'Identity confirmation failed. No proposal action was submitted.',
  };
}
