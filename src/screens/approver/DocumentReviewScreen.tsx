import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../constants/theme';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import {
  approveActivityProposal,
  getActivityProposal,
  rejectActivityProposal,
  requestActivityProposalRevision,
} from '../../services/documentService';
import type { Document } from '../../types/document';
import { formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

const STAGE_LABELS: Record<Document['currentStage'], string> = {
  submitted: 'Submitted',
  adviser_review: 'Adviser Review',
  program_chair_review: 'Program Chair Review',
  completed: 'Completed',
  rejected: 'Rejected',
};

export default function DocumentReviewScreen({ route }: Props) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getActivityProposal(route.params.documentId)
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

  async function handleAction(action: 'approve' | 'revision' | 'reject') {
    if (!document) {
      return;
    }

    try {
      setIsUpdating(true);
      const updatedDocument =
        action === 'approve'
          ? await approveActivityProposal(document.id)
          : action === 'revision'
            ? await requestActivityProposalRevision(
                document.id,
                'Please review the requested changes before resubmitting.',
              )
            : await rejectActivityProposal(
                document.id,
                'This request was rejected for mock UI testing.',
              );
      const refreshedDocument = await getActivityProposal(updatedDocument.id);
      setDocument(refreshedDocument);
      Alert.alert('Review submitted', 'The Activity Proposal was updated successfully.');
    } catch (caught) {
      Alert.alert(
        'Action failed',
        caught instanceof Error ? caught.message : 'Unable to update the document.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function confirmAction(action: 'approve' | 'revision' | 'reject') {
    const messages = {
      approve: 'Are you sure you want to approve this Activity Proposal?',
      revision: 'Are you sure you want to return this Activity Proposal for revision?',
      reject: 'Are you sure you want to reject this Activity Proposal?',
    };

    Alert.alert('Confirm review action', messages[action], [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: () => void handleAction(action),
      },
    ]);
  }

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
        <Text style={[styles.label, styles.spaced]}>Current stage</Text>
        <Text style={styles.value}>{STAGE_LABELS[document.currentStage]}</Text>
        <Text style={[styles.label, styles.spaced]}>Progress</Text>
        <Text style={styles.value}>
          Step {document.currentStep} of {document.totalSteps}
        </Text>
        <Text style={[styles.label, styles.spaced]}>Notes</Text>
        <Text style={styles.body}>
          {document.description}
        </Text>
      </Card>

      {document.attachments.length > 0 ? (
        <Card style={styles.card}>
          <Text style={styles.label}>Attachments</Text>
          {document.attachments.map((attachment) => (
            <Text key={attachment.id} style={styles.attachment}>
              {attachment.fileName} ({attachment.fileType}, {attachment.sizeLabel})
            </Text>
          ))}
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.label}>Review history</Text>
        {document.history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyAction}>{item.action}</Text>
            <Text style={styles.body}>
              {item.actorName} ({item.actorRole}) - {STAGE_LABELS[item.stage]}
            </Text>
            <Text style={styles.historyTime}>{formatDateTime(item.timestamp)}</Text>
            {item.remarks ? <Text style={styles.body}>{item.remarks}</Text> : null}
          </View>
        ))}
      </Card>

      {document.permissions.can_approve ? (
        <AppButton
          label="Approve request"
          loading={isUpdating}
          onPress={() => confirmAction('approve')}
        />
      ) : null}
      {document.permissions.can_request_revision ? (
        <AppButton
          label="Request revision"
          loading={isUpdating}
          onPress={() => confirmAction('revision')}
          style={styles.returnButton}
        />
      ) : null}
      {document.permissions.can_reject ? (
        <AppButton
          label="Reject request"
          loading={isUpdating}
          onPress={() => confirmAction('reject')}
          style={styles.returnButton}
          variant="danger"
        />
      ) : null}
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
  attachment: {
    marginTop: 10,
    color: colors.text,
    fontSize: 14,
  },
  historyItem: {
    marginTop: 14,
  },
  historyAction: {
    color: colors.text,
    fontWeight: '700',
  },
  historyTime: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  returnButton: {
    marginTop: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
