import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? 'SDAO User')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      Alert.alert('Sign out', 'Signed out on this device.');
    }
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
        <View style={styles.roles}>
          {(user?.roles.length ? user.roles : ['No roles loaded']).map((role) => (
            <View key={role} style={styles.roleChip}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.note}>
        <Text style={styles.noteTitle}>Managed on the web</Text>
        <Text style={styles.noteText}>
          Password changes, email verification, and role assignment stay in the
          SDAO DMS web system.
        </Text>
      </Card>

      <AppButton label="Sign out" onPress={handleLogout} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: colors.textMuted,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 24,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  initials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  email: {
    marginTop: 4,
    color: colors.textMuted,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  roleChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  note: {
    marginBottom: 20,
  },
  noteTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  noteText: {
    marginTop: 6,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
