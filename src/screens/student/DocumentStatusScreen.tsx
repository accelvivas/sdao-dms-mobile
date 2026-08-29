import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/theme';
import type { StudentStackParamList } from '../../navigation/StudentNavigator';
import { getDocumentById } from '../../services/documentService';
import type { Document } from '../../types/document';
import { formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<StudentStackParamList, 'DocumentStatus'>;

const timeline = [
  { title: 'Submitted', detail: 'Request received by SDAO.' },
  { title: 'Assigned', detail: 'Waiting for an approver.' },
  { title: 'In review', detail: 'An officer is checking the request.' },
];

export default function DocumentStatusScreen({ route }: Props) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDocumentById(route.params.documentId)
      .then((item) => {
        if (isMounted) {
          setDocument(item);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDocument(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [route.params.documentId]);

  if (isLoading) {
    return (
      <Screen scroll>
        <Text style={styles.emptyText}>Loading document...</Text>
      </Screen>
    );
  }

  if (!document) {
    return (
      <Screen scroll>
        <Text style={styles.emptyText}>Document not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.kicker}>{document.id}</Text>
      <Text style={styles.title}>{document.title}</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status={document.status} />
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Submitted</Text>
        <Text style={styles.value}>{formatDateTime(document.submittedAt)}</Text>
        <Text style={[styles.label, styles.spaced]}>Last update</Text>
        <Text style={styles.value}>{formatDateTime(document.updatedAt)}</Text>
      </Card>

      <Text style={styles.section}>Timeline</Text>
      <Card>
        {timeline.map((item, index) => (
          <View key={item.title} style={styles.step}>
            <View style={styles.rail}>
              <View style={styles.dot} />
              {index < timeline.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  badgeRow: {
    marginTop: 12,
    marginBottom: 16,
  },
  card: {
    marginBottom: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  spaced: {
    marginTop: 14,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primarySoft,
    marginVertical: 4,
  },
  stepCopy: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  stepDetail: {
    marginTop: 2,
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
