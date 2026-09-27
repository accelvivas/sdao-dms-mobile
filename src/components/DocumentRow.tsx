import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../constants/theme';
import type { Document } from '../types/document';
import { formatDate } from '../utils/date';
import { StatusBadge } from './StatusBadge';

type Props = {
  document: Document;
  onPress?: () => void;
  showSubmitter?: boolean;
};

export function DocumentRow({ document, onPress, showSubmitter = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.id}>{document.id}</Text>
        <StatusBadge status={document.status} />
      </View>
      <Text style={styles.title}>{document.title}</Text>
      <View style={styles.bottomRow}>
        <Text numberOfLines={2} style={styles.meta}>
          {showSubmitter ? `${document.submittedBy} · ` : ''}
          {formatDate(document.updatedAt)}
        </Text>
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.72,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  id: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  meta: {
    flex: 1,
    color: colors.textMuted,
    ...typography.supporting,
    fontSize: 13,
    lineHeight: 18,
  },
});
