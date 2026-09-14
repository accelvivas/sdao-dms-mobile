import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../constants/theme';
import type { DocumentStatus } from '../types/document';

const STATUS_COPY: Record<DocumentStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Pending', bg: colors.warningSoft, fg: colors.warning },
  in_review: { label: 'In review', bg: colors.infoSoft, fg: colors.info },
  approved: { label: 'Approved', bg: colors.successSoft, fg: colors.success },
  revision_requested: {
    label: 'Request revision',
    bg: colors.warningSoft,
    fg: colors.warning,
  },
  rejected: { label: 'Returned', bg: colors.dangerSoft, fg: colors.danger },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const tone = STATUS_COPY[status];

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
