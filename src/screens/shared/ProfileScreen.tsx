import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';

const ROLE_LABELS: Record<string, string> = {
  approver: 'Approver',
  adviser: 'Adviser',
  program_chair: 'Program Chair',
  dean: 'Dean',
  principal: 'Principal',
  sdao_member: 'SDAO Member',
  assistant_director_academic_services: 'Assistant Director for Academic Services',
  academic_director: 'Academic Director',
  executive_director: 'Executive Director',
};

function formatRoleLabel(role: string): string {
  return ROLE_LABELS[role.toLowerCase()]
    ?? role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<ApproverStackParamList>>();
  const initials = (user?.name ?? 'SDAO User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const assignmentLabels = user?.roleAssignments
    .filter((assignment) => assignment.role !== 'approver')
    .map((assignment) => assignment.label || formatRoleLabel(assignment.role))
    ?? [];
  const roleLabels = user?.roles
    .filter((role) => role.toLowerCase() !== 'approver')
    .map(formatRoleLabel)
    ?? [];
  const positions = Array.from(new Set([...assignmentLabels, ...roleLabels]));
  const isApprover = user?.roles.some((role) => role.toLowerCase() === 'approver') ?? false;

  async function performLogout() {
    try {
      await logout();
    } catch {
      Alert.alert('Unable to sign out', 'Please check your connection and try again.');
    }
  }

  function confirmLogout() {
    Alert.alert(
      'Sign out?',
      'You will need to enter your account credentials again to review proposals.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => void performLogout() },
      ],
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account details from your web login.</Text>

      <Card style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Existing SDAO user'}</Text>
        <Text style={styles.email}>{user?.email ?? 'Not signed in'}</Text>
        {isApprover ? (
          <View style={styles.approverChip}>
            <Text style={styles.approverText}>Approver</Text>
          </View>
        ) : null}
        {positions.length ? (
          <View style={styles.positions}>
            {positions.map((position) => (
              <Text key={position} style={styles.position}>{position}</Text>
            ))}
          </View>
        ) : null}
      </Card>

      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountIcon}>
            <Ionicons color={colors.primary} name="desktop-outline" size={20} />
          </View>
          <Text style={styles.accountTitle}>Account Management</Text>
        </View>
        <Text style={styles.accountText}>
          Password changes, email verification, and role assignments are managed through the
          SDAO DMS web system.
        </Text>
      </Card>

      <AppButton
        label="Privacy and security"
        onPress={() => navigation.navigate('PrivacyAndSecurity')}
        style={styles.privacyButton}
        variant="secondary"
      />
      <AppButton label="Sign out" onPress={confirmLogout} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
    color: colors.textMuted,
    ...typography.supporting,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  initials: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  email: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    ...typography.supporting,
    textAlign: 'center',
  },
  approverChip: {
    marginTop: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  approverText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  positions: {
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  position: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  accountCard: {
    marginBottom: spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTitle: {
    flex: 1,
    color: colors.text,
    ...typography.cardTitle,
  },
  accountText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    ...typography.supporting,
  },
  privacyButton: {
    marginBottom: spacing.sm,
  },
});
