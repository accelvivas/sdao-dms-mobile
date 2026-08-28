import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFactor'>;

export default function TwoFactorScreen({ route }: Props) {
  const { confirmTwoFactor } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify() {
    try {
      setIsSubmitting(true);
      await confirmTwoFactor({ email: route.params.email, code });
    } catch {
      Alert.alert('Verification failed', 'The code is invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Two-factor authentication</Text>
      <Text style={styles.subtitle}>
        Enter the code sent to {route.params.email}
      </Text>
      <TextInput
        keyboardType="number-pad"
        onChangeText={setCode}
        placeholder="6-digit code"
        style={styles.input}
        value={code}
      />
      <Pressable
        disabled={isSubmitting}
        onPress={handleVerify}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475467',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
