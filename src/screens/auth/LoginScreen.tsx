import { useState } from 'react';
import { Alert, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
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
            <Text style={styles.subtitle}>
              Use the same account created on the SDAO DMS web system.
            </Text>

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
              No mobile registration. New accounts, password resets, and role
              assignment are handled on the web system.
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
    backgroundColor: 'rgba(12, 22, 42, 0.45)',
  },
  hero: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 56,
    alignItems: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: 18,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandDivider: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  sheet: {
    marginTop: -32,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 440,
  },
  card: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(10,29,59,0.10)',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 22,
    lineHeight: 20,
    fontSize: 14,
  },
  fieldGroup: {
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FCEEED',
    borderRadius: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    flexShrink: 1,
  },
  signInButton: {
    marginTop: 22,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 8,
  },
  noteText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});