import { type ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  rightSlot?: ReactNode;
};

export function AppTextField({
  label,
  error,
  rightSlot,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? hidden : false}
          style={styles.input}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable hitSlop={8} onPress={() => setHidden((value) => !value)}>
            <Ionicons
              color={colors.textMuted}
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>
        ) : (
          rightSlot
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  error: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 13,
  },
});
