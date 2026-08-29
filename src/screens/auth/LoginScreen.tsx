import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { AppTextField } from '../../components/AppTextField';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius } from '../../constants/theme';
import { isTwoFactorRequired, useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/RootNavigator';
import { getAuthErrorMessage } from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
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
      const result = await login({ email: email.trim(), password });

      if (isTwoFactorRequired(result)) {
        navigation.navigate('TwoFactor', {
          email: email.trim(),
          challengeToken: result.challengeToken,
        });
      }
    } catch (caught) {
      const message = getAuthErrorMessage(caught);
      setError(message);
      Alert.alert('Sign in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen padded={false} scroll backgroundColor={colors.primaryDark}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Ionicons color={colors.accent} name="folder-open" size={32} />
        </View>
        <Text style={styles.brand}>SDAO DMS</Text>
        <Text style={styles.heroCopy}>Student Development and Activities Office</Text>
      </View>

      <View style={styles.sheet}>
        <Card>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Use the same account created on the SDAO DMS web system.
          </Text>

          <AppTextField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="name@school.edu"
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
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton
            label="Sign in"
            loading={isSubmitting}
            onPress={handleLogin}
          />
        </Card>

        <View style={styles.note}>
          <Ionicons color={colors.textMuted} name="information-circle-outline" size={18} />
          <Text style={styles.noteText}>
            No mobile registration. New accounts, password resets, and role
            assignment are handled on the web system.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,162,39,0.45)',
  },
  brand: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroCopy: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  sheet: {
    marginTop: -28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 420,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  noteText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
