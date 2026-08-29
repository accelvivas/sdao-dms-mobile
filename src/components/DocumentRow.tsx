import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/theme';
import { formatDate } from '../utils/date';
import type { Document } from '../types/document';
import { StatusBadge } from './StatusBadge';

type Props = {
  document: Document;
  onPress?: () => void;
  showSubmitter?: boolean;
};

export function DocumentRow({ document, onPress, showSubmitter = false }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <Text style={styles.id}>{document.id}</Text>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.meta}>
          {showSubmitter ? `${document.submittedBy} · ` : ''}
          {formatDate(document.updatedAt)}
        </Text>
      </View>
      <View style={styles.aside}>
        <StatusBadge status={document.status} />
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  copy: {
    flex: 1,
  },
  id: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  aside: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
