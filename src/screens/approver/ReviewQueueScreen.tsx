import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/theme';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import type { Document } from '../../types/document';
import { formatDate } from '../../utils/date';

export default function ReviewQueueScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ReviewQueue'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadQueue(refresh = false) {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const items = await getReviewQueue();
      setDocuments(items);
    } catch {
      setError('Unable to load Activity Proposals. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadQueue().catch(() => undefined);
  }, []);

  const oldestDocument = documents.reduce<Document | null>((oldest, document) => {
    if (!oldest || document.submittedAt < oldest.submittedAt) {
      return document;
    }
    return oldest;
  }, null);

  return (
    <Screen onRefresh={() => loadQueue(true)} refreshing={isRefreshing} scroll>
      <Text style={styles.title}>Activity Proposals</Text>
      <Text style={styles.queueTitle}>Review Queue</Text>
      <Text style={styles.subtitle}>1 proposal awaiting your review.</Text>

      {isLoading ? <Card><Text style={styles.emptyText}>Loading queue...</Text></Card> : null}
      {error ? <Card><Text style={styles.errorText}>{error}</Text></Card> : null}
      {!isLoading && !error && documents.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            No Activity Proposals are currently awaiting your review.
          </Text>
        </Card>
      ) : null}

      {!isLoading && !error && documents.length > 0 ? (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{documents.length}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Oldest Waiting</Text>
              <Text style={styles.summaryValueSmall}>
                {oldestDocument ? formatDate(oldestDocument.submittedAt) : '-'}
              </Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Pending Your Action</Text>

          {documents.map((document) => (
            <Card key={document.id} style={styles.proposalCard}>
              <Text style={styles.proposalType}>Activity Proposal</Text>
              <Text style={styles.proposalTitle}>{document.title}</Text>
              <Text style={styles.organization}>{document.submittedBy}</Text>
              <Text style={styles.metadata}>
                Off Calendar {'\u00b7'} Step {document.currentStep}
              </Text>
              <View style={styles.proposalFooter}>
                <StatusBadge status={document.status} />
              </View>
              <AppButton
                label="Review Proposal"
                onPress={() =>
                  navigation.navigate('DocumentReview', { documentId: document.id })
                }
                style={styles.reviewButton}
              />
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  queueTitle: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    color: colors.textMuted,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    minHeight: 98,
    padding: 14,
    borderRadius: 14,
    shadowOpacity: 0,
    elevation: 0,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: 10,
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  summaryValueSmall: {
    marginTop: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  proposalCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 18,
  },
  proposalType: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  proposalTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  organization: {
    marginTop: 14,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  metadata: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 14,
  },
  proposalFooter: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  reviewButton: {
    width: '100%',
    marginTop: 18,
  },
  emptyText: {
    color: colors.textMuted,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.danger,
    paddingVertical: 8,
  },
});
