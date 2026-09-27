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

import { colors, layout, radius, spacing, typography } from '../constants/theme';

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
  onBlur,
  onFocus,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const [focused, setFocused] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        <TextInput
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? hidden : false}
          style={styles.input}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.rightButton}
          >
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
    gap: spacing.xs,
  },
  label: {
    ...typography.supporting,
    fontWeight: '600',
    color: colors.text,
  },
  field: {
    minHeight: layout.controlHeight,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  rightButton: {
    width: 40,
    height: 40,
    marginRight: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
