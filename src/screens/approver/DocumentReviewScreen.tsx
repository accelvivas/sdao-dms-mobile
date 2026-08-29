import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/theme';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import { getDocumentById } from '../../services/documentService';
import type { Document } from '../../types/document';
import { formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

export default function DocumentReviewScreen({ route }: Props) {
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
        <Text style={styles.emptyText}>Loading request...</Text>
      </Screen>
    );
  }

  if (!document) {
    return (
      <Screen scroll>
        <Text style={styles.emptyText}>Request not found.</Text>
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
        <Text style={styles.label}>Submitted by</Text>
        <Text style={styles.value}>{document.submittedBy}</Text>
        <Text style={[styles.label, styles.spaced]}>Submitted at</Text>
        <Text style={styles.value}>{formatDateTime(document.submittedAt)}</Text>
        <Text style={[styles.label, styles.spaced]}>Notes</Text>
        <Text style={styles.body}>
          Sample request details. File preview and remarks will appear here
          once the API is connected.
        </Text>
      </Card>

      <AppButton
        label="Approve request"
        onPress={() => Alert.alert('Preview', 'Approve is not connected yet.')}
      />
      <AppButton
        label="Return with comments"
        onPress={() => Alert.alert('Preview', 'Return is not connected yet.')}
        style={styles.returnButton}
        variant="danger"
      />
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
  body: {
    marginTop: 6,
    color: colors.textMuted,
    lineHeight: 20,
  },
  returnButton: {
    marginTop: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
