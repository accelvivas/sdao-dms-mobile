import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../constants/theme';
import { AppButton } from './AppButton';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  loading?: boolean;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  loading = false,
  onAction,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons color={colors.primary} name={icon} size={26} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          style={styles.action}
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
  },
  message: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textMuted,
    ...typography.supporting,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
