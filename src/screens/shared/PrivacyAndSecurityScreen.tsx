import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

type SectionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
};

function Section({ icon, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Ionicons color={colors.primary} name={icon} size={19} />
        </View>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function Bullet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>{'\u2022'}</Text>
      <Text style={styles.bodyText}>
        <Text style={styles.strong}>{title}: </Text>
        {children}
      </Text>
    </View>
  );
}

function ContactLink({
  icon,
  label,
  url,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  url?: string;
}) {
  const content = (
    <>
      <Ionicons color={colors.primary} name={icon} size={16} />
      <Text style={[styles.contactText, url && styles.linkText]}>{label}</Text>
    </>
  );

  if (!url) {
    return <View style={styles.contactRow}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export default function PrivacyAndSecurityScreen({ requiresDecision = false }: { requiresDecision?: boolean }) {
  const { acceptPrivacyNotice, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function declineAndLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      setIsLoggingOut(false);
      Alert.alert('Unable to log out', 'Please check your connection and try again.');
    }
  }

  function confirmDecline() {
    Alert.alert(
      'Decline Privacy Notice?',
      'You must accept the Privacy Notice to use SDAO DMS. Declining will log you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline and log out', style: 'destructive', onPress: () => void declineAndLogout() },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={requiresDecision ? ['top', 'left', 'right', 'bottom'] : ['left', 'right', 'bottom']}
      style={styles.safeArea}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.introduction}>
          <View style={styles.heroIcon}>
            <Ionicons color={colors.primary} name="shield-checkmark" size={25} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>Privacy Notice</Text>
          <Text style={styles.subtitle}>
            National University Lipa - Student Development and Activities Office
          </Text>
          <Text style={styles.introText}>
            We value your privacy and are committed to protecting your personal data in
            accordance with the Data Privacy Act of 2012 (RA 10173). This notice explains how
            SDAO DMS collects, uses, shares, retains, and protects your information.
          </Text>
        </View>

        <Section icon="person-outline" title="Personal data we collect">
          <Bullet title="Account details">
            your name, NU email address, school or employee number, role, office, and organization assignment.
          </Bullet>
          <Bullet title="Organization records">
            organization details, officers, advisers, membership information, and registration records.
          </Bullet>
          <Bullet title="Approval records">
            submitted documents, approval routes, decisions, comments, timestamps, and audit history.
          </Bullet>
          <Bullet title="System data">
            sign-in activity, device details, IP address, notification token, and security logs.
          </Bullet>
        </Section>

        <Section icon="compass-outline" title="Why we use your data">
          <Bullet title="Organization management">
            to manage registrations, renewals, officers, advisers, and organization records.
          </Bullet>
          <Bullet title="Approval processing">
            to route documents to authorized reviewers and record their decisions.
          </Bullet>
          <Bullet title="Document creation">
            to generate approved forms, documents, and official reports.
          </Bullet>
          <Bullet title="Records auditing">
            to maintain accountability, security, and compliance with university requirements.
          </Bullet>
        </Section>

        <Section icon="eye-outline" title="Who can see your data">
          <Text style={styles.bodyText}>
            Access is limited to relevant NU offices, assigned approvers, and authorized SDAO
            administrators. Information may also be disclosed to service providers or government
            authorities when permitted or required by law. NU Lipa does not sell your personal data.
          </Text>
        </Section>

        <Section icon="time-outline" title="How long we keep it">
          <Text style={styles.bodyText}>
            We retain personal data only for as long as it is needed for the purposes stated above
            and for applicable legal, audit, and records-management requirements. Information that
            is no longer required is securely deleted or disposed of. Official records may be
            archived longer under NU and SDAO retention policies.
          </Text>
        </Section>

        <Section icon="lock-closed-outline" title="How we protect it">
          <Bullet title="Role-based access">users can access only information allowed by their assigned role.</Bullet>
          <Bullet title="Secure connections">production traffic uses encrypted HTTPS connections.</Bullet>
          <Bullet title="Secure storage">authentication information is protected by device and system security controls.</Bullet>
          <Bullet title="Confidentiality rules">authorized personnel must follow NU privacy and data-handling policies.</Bullet>
        </Section>

        <Section icon="hand-left-outline" title="Your rights and how to contact us">
          <Text style={styles.bodyText}>
            Subject to applicable law and NU policies, you have the right to be informed, access,
            object, rectify, request erasure or blocking, request data portability, claim damages,
            and file a complaint concerning your personal data.
          </Text>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>NU Data Privacy Office</Text>
            <ContactLink icon="mail-outline" label="dpo@national-u.edu.ph" url="mailto:dpo@national-u.edu.ph" />
            <ContactLink icon="mail-outline" label="cop@nu-lipa.edu.ph" url="mailto:cop@nu-lipa.edu.ph" />
            <ContactLink icon="location-outline" label="551 M.F. Jhocson Street, Sampaloc, Manila 1008" />
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>SDAO Office · NU Lipa</Text>
            <ContactLink icon="location-outline" label="SM City Lipa, Ayala Highway, Lipa City, Batangas 4217" />
            <ContactLink icon="call-outline" label="0917-568-5472" url="tel:09175685472" />
          </View>
        </Section>

        <Text style={styles.updated}>Last updated: October 1, 2023.</Text>
      </ScrollView>

      {requiresDecision ? (
        <View style={styles.decisionBar}>
          <Text style={styles.decisionText}>
            Accept this Privacy Notice to continue to SDAO DMS.
          </Text>
          <View style={styles.decisionActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isLoggingOut}
              onPress={confirmDecline}
              style={({ pressed }) => [
                styles.declineButton,
                pressed && !isLoggingOut && styles.pressed,
              ]}
            >
              {isLoggingOut ? (
                <ActivityIndicator color={colors.danger} />
              ) : (
                <>
                  <Ionicons color={colors.danger} name="log-out-outline" size={18} />
                  <Text style={styles.declineText}>Decline and log out</Text>
                </>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isLoggingOut}
              onPress={acceptPrivacyNotice}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && !isLoggingOut && styles.pressed,
                isLoggingOut && styles.disabled,
              ]}
            >
              <Ionicons color={colors.white} name="checkmark" size={19} />
              <Text style={styles.acceptText}>I Accept</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introduction: {
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 4,
    borderTopColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  heroIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  title: {
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  introText: {
    color: colors.textMuted,
    ...typography.supporting,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    ...typography.cardTitle,
  },
  sectionContent: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bullet: {
    color: colors.accent,
    fontSize: 17,
    lineHeight: 21,
  },
  bodyText: {
    flex: 1,
    color: colors.textMuted,
    ...typography.supporting,
  },
  strong: {
    color: colors.text,
    fontWeight: '700',
  },
  contactCard: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  contactTitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  contactRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  updated: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
  decisionBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadow.card,
    shadowOffset: { width: 0, height: -3 },
  },
  decisionText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  decisionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineButton: {
    minHeight: 50,
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  declineText: {
    color: colors.danger,
    ...typography.button,
  },
  acceptButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  acceptText: {
    color: colors.white,
    ...typography.button,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.7,
  },
});
