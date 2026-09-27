import { useState } from 'react';
import { Alert, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppButton } from '../../components/AppButton';
import { AppTextField } from '../../components/AppTextField';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../services/authService';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter the email and password for your existing account.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
    } catch (caught) {
      const message = getAuthErrorMessage(caught);
      setError(message);
      Alert.alert('Sign in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/nu-lipa-campus.jpg')}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.darkOverlay} />
      <Screen padded={false} scroll backgroundColor="transparent">
        <StatusBar style="light" />

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/nulogo3.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brand}>SDAO DMS</Text>
          <View style={styles.brandDivider} />
          <Text style={styles.heroCopy}>Student Development and Activities Office</Text>
        </View>

        {/* Sheet */}
        <View style={styles.sheet}>
          <Card style={styles.card}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Use your authorized approver account.</Text>

            <View style={styles.fieldGroup}>
              <AppTextField
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                label="Email"
                onChangeText={setEmail}
                placeholder="email@example.com"
                textContentType="username"
                value={email}
              />
              <AppTextField
                label="Password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                textContentType="password"
                value={password}
                onSubmitEditing={() => void handleLogin()}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons color={colors.danger} name="alert-circle" size={16} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <AppButton
              label="Sign in"
              loading={isSubmitting}
              onPress={handleLogin}
              style={styles.signInButton}
            />
          </Card>

          <View style={styles.note}>
            <Ionicons color={colors.textMuted} name="information-circle-outline" size={18} />
            <Text style={styles.noteText}>
              Accounts and account settings are managed through the SDAO DMS web system.
            </Text>
          </View>
        </View>
      </Screen>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  hero: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logoImage: {
    width: 84,
    height: 84,
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandDivider: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    ...typography.supporting,
    letterSpacing: 0.2,
  },
  sheet: {
    flexGrow: 1,
    marginTop: -24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 22,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    ...typography.supporting,
  },
  fieldGroup: {
    gap: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    flexShrink: 1,
  },
  signInButton: {
    marginTop: spacing.lg,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  noteText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
