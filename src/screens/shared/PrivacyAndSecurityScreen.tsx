import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing, typography } from '../../constants/theme';

type PrivacySectionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: string;
};

function PrivacySection({ icon, title, children }: PrivacySectionProps) {
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.primary} name={icon} size={20} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{children}</Text>
    </Card>
  );
}

export default function PrivacyAndSecurityScreen() {
  async function openDeviceSettings() {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Settings unavailable', 'Open the device Settings app to manage permissions.');
    }
  }

  async function openWebSystem() {
    const url = 'https://nulpsdao.com';
    try {
      if (!(await Linking.canOpenURL(url))) throw new Error('Unsupported URL');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Website unavailable', 'Visit nulpsdao.com to manage your account data.');
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.kicker}>PRIVACY AND SECURITY</Text>
      <Text style={styles.title}>Your data in SDAO DMS</Text>
      <Text style={styles.subtitle}>
        This notice explains what the mobile app uses, why it is needed, and the controls available to you.
      </Text>

      <PrivacySection icon="person-circle-outline" title="Information used">
        The app receives your account name, school email, assigned roles, mobile-access status, and proposal information from the authorized SDAO DMS server. If push notifications are enabled, it also registers a random device identifier, device name, platform, and push token.
      </PrivacySection>

      <PrivacySection icon="shield-checkmark-outline" title="Purpose and protection">
        Information is used only to authenticate authorized approvers, display assigned Activity Proposals, submit review actions, open requested attachments, and deliver review notifications. Authentication and push tokens are encrypted through the device security system, authenticated screens block capture, and production API traffic is restricted to HTTPS.
      </PrivacySection>

      <PrivacySection icon="share-social-outline" title="Sharing and retention">
        The app communicates with the SDAO DMS API and Expo notification services when push notifications are enabled. It does not include advertising or analytics SDKs. An attachment is shared with another app only when you choose to open it, and the temporary mobile copy is deleted after the system share dialog closes.
      </PrivacySection>

      <PrivacySection icon="options-outline" title="Your controls">
        You can manage notification and biometric permissions in device settings. Signing out revokes the registered push token when reachable and removes the local authentication token. Account correction, access, retention, or deletion requests must be handled through the official SDAO DMS web system and applicable university procedures.
      </PrivacySection>

      <View style={styles.actions}>
        <AppButton
          label="Manage device permissions"
          onPress={() => void openDeviceSettings()}
          variant="secondary"
        />
        <AppButton
          label="Open SDAO DMS website"
          onPress={() => void openWebSystem()}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.accent,
    ...typography.label,
    letterSpacing: 0.7,
  },
  title: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: colors.textMuted,
    ...typography.supporting,
  },
  sectionCard: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    ...typography.cardTitle,
  },
  sectionText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    ...typography.body,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
