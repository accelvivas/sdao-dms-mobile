import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import type { Document } from '../../types/document';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';
import { formatDate } from '../../utils/date';

export default function ReviewQueueScreen() {
  const { logout } = useAuth();
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

  const loadQueue = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const items = await getReviewQueue();
      setDocuments(items.filter((document) => document.permissions.can_act));
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        await logout();
        return;
      }
      setError(getApiErrorMessage(
        caught,
        'Unable to load Activity Proposals. Please try again.',
      ));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [logout]);

  useFocusEffect(
    useCallback(() => {
      void loadQueue();
    }, [loadQueue]),
  );

  const oldestDocument = documents.reduce<Document | null>((oldest, document) => {
    if (!oldest || document.submittedAt < oldest.submittedAt) return document;
    return oldest;
  }, null);

  return (
    <Screen onRefresh={() => void loadQueue(true)} refreshing={isRefreshing} scroll>
      <Text style={styles.kicker}>Review Queue</Text>
      <Text style={styles.title}>Activity Proposals</Text>
      <Text style={styles.subtitle}>
        {isLoading
          ? 'Loading your review queue.'
          : `${documents.length} proposal${documents.length === 1 ? '' : 's'} awaiting your review.`}
      </Text>

      {isLoading ? (
        <Card>
          <EmptyState
            icon="hourglass-outline"
            loading
            message="Fetching proposals assigned to you."
            title="Loading review queue"
          />
        </Card>
      ) : error ? (
        <Card>
          <EmptyState
            actionLabel="Try Again"
            icon="alert-circle-outline"
            message={error}
            onAction={() => void loadQueue()}
            title="Unable to load proposals"
          />
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <EmptyState
            icon="checkmark-circle-outline"
            message="No Activity Proposals are currently awaiting your review."
            title="You're all caught up"
          />
        </Card>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{documents.length}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Oldest Waiting</Text>
              <Text style={styles.summaryDate}>
                {oldestDocument ? formatDate(oldestDocument.submittedAt) : '—'}
              </Text>
            </Card>
          </View>

          <SectionHeader title="Pending Your Action" />

          {documents.map((document) => (
            <Card key={document.id} style={styles.proposalCard}>
              <View style={styles.proposalHeader}>
                <Text style={styles.proposalType}>Activity Proposal</Text>
                <StatusBadge status={document.status} />
              </View>
              <Text style={styles.proposalTitle}>{document.title}</Text>
              <Text style={styles.organization}>{document.submittedBy}</Text>
              <Text style={styles.metadata}>
                {document.currentStageLabel
                  ?? `Step ${document.currentStep} of ${document.totalSteps}`}
              </Text>
              <AppButton
                label="Review Proposal"
                onPress={() => navigation.navigate('DocumentReview', { documentId: document.id })}
                style={styles.reviewButton}
              />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.accent,
    ...typography.label,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
    color: colors.textMuted,
    ...typography.supporting,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    minHeight: 84,
    padding: spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
  },
  summaryDate: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  proposalCard: {
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  proposalType: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  proposalTitle: {
    marginTop: spacing.sm,
    color: colors.text,
    ...typography.cardTitle,
  },
  organization: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  metadata: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    ...typography.supporting,
  },
  reviewButton: {
    width: '100%',
    marginTop: spacing.md,
  },
});
