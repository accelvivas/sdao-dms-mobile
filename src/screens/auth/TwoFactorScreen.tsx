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
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/RootNavigator';
import { getAuthErrorMessage } from '../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFactor'>;

export default function TwoFactorScreen({ navigation, route }: Props) {
  const { confirmTwoFactor } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify() {
    if (!code.trim()) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await confirmTwoFactor({
        email: route.params.email,
        challengeToken: route.params.challengeToken,
        code: code.trim(),
      });
    } catch (caught) {
      const message = getAuthErrorMessage(caught);
      setError(message);
      Alert.alert('Verification failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen padded={false} scroll>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>
          Back
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.primary} name="shield-checkmark" size={32} />
        </View>
        <Text style={styles.title}>Verify it’s you</Text>
        <Text style={styles.subtitle}>
          Two-factor authentication is enabled on this account. Enter the code
          for {route.params.email}.
        </Text>

        <Card>
          <AppTextField
            autoFocus
            keyboardType="number-pad"
            label="Authenticator code"
            maxLength={8}
            onChangeText={setCode}
            placeholder="123456"
            textContentType="oneTimeCode"
            value={code}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton
            label="Verify and continue"
            loading={isSubmitting}
            onPress={handleVerify}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  back: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textMuted,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
  },
});
