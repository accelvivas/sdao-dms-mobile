import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import {
  deleteDownloadedProposalAttachment,
  downloadProposalAttachment,
} from '../../services/attachmentService';
import {
  approveActivityProposal,
  getActivityProposal,
  rejectActivityProposal,
  requestActivityProposalRevision,
} from '../../services/documentService';
import { authenticateSensitiveAction } from '../../services/sensitiveActionAuth';
import type { Document } from '../../types/document';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';
import { formatDate, formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  adviser_review: 'Adviser Review',
  program_chair_review: 'Program Chair Review',
  principal_review: 'Principal Review',
  completed: 'Completed',
  rejected: 'Rejected',
};

function formatCurrency(value?: number): string {
  return value === undefined
    ? '—'
    : `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function DocumentReviewScreen({ navigation, route }: Props) {
  const { logout } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setDocument(await getActivityProposal(route.params.documentId));
    } catch (error: unknown) {
      const status = getApiErrorStatus(error);
      if (status === 401) {
        await logout();
        return;
      }
      const fallback = status === 403
        ? 'You are not allowed to view this proposal.'
        : status === 404
          ? 'This proposal could not be found.'
          : 'Unable to load this Activity Proposal. Please try again.';
      setLoadError(getApiErrorMessage(error, fallback));
    } finally {
      setIsLoading(false);
    }
  }, [logout, route.params.documentId]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  async function handleAction(action: 'approve' | 'revision' | 'reject') {
    if (!document) return;
    const typedRevisionRemarks = remarks.trim();
    const typedRejectRemarks = rejectRemarks.trim();
    if (action === 'revision' && !typedRevisionRemarks) {
      Alert.alert('Remarks required', 'Enter an explanation for the requested revisions.');
      return;
    }
    if (action === 'reject' && !typedRejectRemarks) {
      Alert.alert('Remarks required', 'Enter a reason for rejecting this proposal.');
      return;
    }

    try {
      const actionLabels = {
        approve: 'proposal approval',
        revision: 'revision request',
        reject: 'proposal rejection',
      };
      const authentication = await authenticateSensitiveAction(actionLabels[action]);
      if (!authentication.success) {
        Alert.alert('Identity confirmation required', authentication.message);
        return;
      }
    } catch {
      Alert.alert(
        'Identity confirmation unavailable',
        'The device could not verify your identity. No proposal action was submitted.',
      );
      return;
    }

    try {
      setIsUpdating(true);
      const validSections = document.activityProposal?.revisionSections ?? [];
      const requestedSections = selectedSections.filter((section) => (
        validSections.includes(section)
      ));
      const requestedSectionNotes = requestedSections.flatMap((section) => {
        const note = sectionNotes[section]?.trim();
        return note ? [`${section}: ${note}`] : [];
      });
      const revisionRemarks = [
        typedRevisionRemarks,
        requestedSections.length
          ? `Sections needing revision: ${requestedSections.join(', ')}`
          : '',
        requestedSectionNotes.length
          ? `Notes by section:\n${requestedSectionNotes.join('\n')}`
          : '',
      ].filter(Boolean).join('\n\n');

      if (action === 'revision' && revisionRemarks.length > 2000) {
        Alert.alert('Remarks too long', 'Revision remarks must not exceed 2000 characters.');
        return;
      }

      const updatedDocument = action === 'approve'
        ? await approveActivityProposal(document.id)
        : action === 'revision'
          ? await requestActivityProposalRevision(document.id, revisionRemarks)
          : await rejectActivityProposal(document.id, typedRejectRemarks);
      setDocument(updatedDocument);
      setRemarks('');
      setRejectRemarks('');
      setSelectedSections([]);
      setSectionNotes({});

      if (action === 'approve') {
        navigation.goBack();
        return;
      }
      Alert.alert('Review submitted', 'The Activity Proposal was updated successfully.');
    } catch (caught: unknown) {
      const status = getApiErrorStatus(caught);
      if (status === 401) {
        await logout();
        return;
      }
      if (status === 403) {
        try {
          setDocument(await getActivityProposal(document.id));
          Alert.alert(
            'Proposal updated',
            'This proposal is no longer at your stage. The current state has been loaded.',
          );
        } catch (refreshError: unknown) {
          if (getApiErrorStatus(refreshError) === 401) {
            await logout();
            return;
          }
          Alert.alert(
            'Proposal changed',
            getApiErrorMessage(
              refreshError,
              'This proposal is no longer at your stage, and its current state could not be loaded.',
            ),
          );
        }
        return;
      }
      const fallback = status === 404
        ? 'This proposal could not be found.'
        : status === 422
          ? 'Review validation failed. Check the remarks and try again.'
          : 'Unable to update the document. Please try again.';
      Alert.alert('Action failed', getApiErrorMessage(caught, fallback));
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

  function toggleSection(section: string) {
    setSelectedSections((current) => (
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section]
    ));
  }

  async function handleOpenAttachment(attachment: Document['attachments'][number]) {
    if (!document || openingAttachmentId) return;
    const attachmentId = String(attachment.id);
    let downloadedUri: string | null = null;
    setOpeningAttachmentId(attachmentId);
    try {
      const downloadedAttachment = await downloadProposalAttachment(document.id, attachment);
      downloadedUri = downloadedAttachment.uri;
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Opening downloaded files is not available on this device.');
      }
      await Sharing.shareAsync(downloadedAttachment.uri, {
        dialogTitle: `Open ${downloadedAttachment.fileName}`,
        mimeType: downloadedAttachment.mimeType,
      });
    } catch (error: unknown) {
      const status = getApiErrorStatus(error);
      if (status === 401) {
        await logout();
        return;
      }
      const fallback = status === 403
        ? 'You are not allowed to download this attachment.'
        : status === 404
          ? 'This attachment could not be found.'
          : 'Unable to download or open this attachment. Please try again.';
      Alert.alert('Attachment unavailable', getApiErrorMessage(error, fallback));
    } finally {
      if (downloadedUri) {
        try {
          deleteDownloadedProposalAttachment(downloadedUri);
        } catch {
          // The operating system also clears cache files; cleanup failure is non-fatal.
        }
      }
      setOpeningAttachmentId(null);
    }
  }

  if (isLoading) {
    return (
      <Screen scroll>
        <Card>
          <EmptyState
            icon="document-text-outline"
            loading
            message="Retrieving the complete proposal and its review history."
            title="Loading Activity Proposal"
          />
        </Card>
      </Screen>
    );
  }

  if (!document) {
    return (
      <Screen scroll>
        <Card>
          <EmptyState
            actionLabel="Try Again"
            icon="alert-circle-outline"
            message={loadError || 'Unable to load this Activity Proposal.'}
            onAction={() => void loadDocument()}
            title="Proposal unavailable"
          />
        </Card>
      </Screen>
    );
  }

  const details = document.activityProposal;
  const approval = details?.approval;
  const canReview = document.permissions.can_act;
  const revisionSections = details?.revisionSections ?? [];
  const stageLabel = document.currentStageLabel
    ?? approval?.stageLabel
    ?? STAGE_LABELS[document.currentStage]
    ?? document.currentStage;

  return (
    <Screen scroll>
      <Text style={styles.kicker}>Activity Proposal</Text>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.organization}>{document.organizationName}</Text>
      <View style={styles.statusRow}>
        <StatusBadge status={document.status} />
        <Text style={styles.documentId}>{document.id}</Text>
      </View>

      {details ? (
        <Card style={[styles.card, styles.summaryCard]}>
          <View style={styles.summaryAccent} />
          <Text style={styles.cardEyebrow}>Activity</Text>
          <Text style={styles.summaryMeta}>
            {details.venue ? `On Calendar · ${details.venue}` : 'Activity details'}
          </Text>
          <Text style={styles.summaryTitle}>{document.title}</Text>
          <Text style={styles.summaryDate}>
            {details.startsAt ? formatDate(details.startsAt) : 'Date not provided'}
            {details.startsAt && details.endsAt
              ? ` · ${formatDate(details.startsAt, 'h:mm A')}–${formatDate(details.endsAt, 'h:mm A')}`
              : ''}
          </Text>
        </Card>
      ) : null}

      {details ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Activity Request Form</Text>
          <InfoField label="Nature of Activity" value={details.natureOfActivity} />
          <InfoField label="Type of Activity" value={details.typeOfActivity} />
          <InfoField
            label="Partner Organization(s) / School(s) / RSO"
            value={details.partnerOrganizations?.join('\n')}
          />
          <InfoField label="Target SDG" value={details.targetSdgs?.join('\n')} />
          <InfoField label="Proposed Budget" value={formatCurrency(details.proposedBudget)} />
          <InfoField label="Budget Source" value={details.budgetSource} />
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Proposal Narrative</Text>
        {details?.objectives?.length ? (
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            {details.objectives.map((objective) => (
              <Text key={objective} style={styles.bullet}>• {objective}</Text>
            ))}
          </View>
        ) : null}
        <View style={styles.narrativeSection}>
          <Text style={styles.sectionTitle}>Activity Description</Text>
          <Text style={styles.body}>{details?.activityDescription ?? document.description}</Text>
        </View>
        {details?.criteriaMechanics ? (
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionTitle}>Criteria / Mechanics</Text>
            <Text style={styles.body}>{details.criteriaMechanics}</Text>
          </View>
        ) : null}
        {details?.programFlow?.length ? (
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionTitle}>Program Flow</Text>
            {details.programFlow.map((item) => (
              <View key={`${item.activity}-${item.duration}`} style={styles.flowItem}>
                <Text style={styles.flowActivity}>{item.activity}</Text>
                {item.duration ? <Text style={styles.flowDuration}>{item.duration}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      {details?.expenses?.length ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Expenses</Text>
          {details.expenses.map((expense) => (
            <View key={`${expense.material}-${expense.quantity}`} style={styles.expenseItem}>
              <Text style={styles.expenseTitle}>{expense.material}</Text>
              <InfoField label="Quantity" value={String(expense.quantity)} />
              <InfoField label="Unit Price" value={formatCurrency(expense.unitPrice)} />
              <InfoField label="Total" value={formatCurrency(expense.total)} />
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(details.expenses.reduce((sum, expense) => sum + expense.total, 0))}
            </Text>
          </View>
        </Card>
      ) : null}

      {details?.responsiblePersons?.length ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Responsible Person(s)</Text>
          {details.responsiblePersons.map((person) => (
            <View key={`${person.name}-${person.role}`} style={styles.personItem}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.body}>{person.role}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Attachments</Text>
        {document.attachments.length ? document.attachments.map((attachment) => {
          const attachmentId = String(attachment.id);
          const isOpening = openingAttachmentId === attachmentId;
          return (
            <View key={attachmentId} style={styles.attachmentRow}>
              <View style={styles.attachmentHeading}>
                <View style={styles.attachmentIcon}>
                  <Ionicons color={colors.primary} name="document-attach-outline" size={20} />
                </View>
                <View style={styles.attachmentCopy}>
                  <Text style={styles.attachmentName}>{attachment.fileName}</Text>
                  <Text style={styles.attachmentMeta}>
                    {attachment.fileType} · {attachment.sizeLabel}
                  </Text>
                </View>
              </View>
              {attachment.description ? (
                <Text style={styles.body}>{attachment.description}</Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={openingAttachmentId !== null}
                onPress={() => void handleOpenAttachment(attachment)}
                style={({ pressed }) => [
                  styles.attachmentAction,
                  pressed && styles.pressed,
                  openingAttachmentId !== null && !isOpening && styles.disabledAction,
                ]}
              >
                {isOpening ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Ionicons color={colors.primary} name="download-outline" size={19} />
                )}
                <Text style={styles.attachmentActionText}>
                  {isOpening ? 'Opening...' : 'Download / Open'}
                </Text>
              </Pressable>
            </View>
          );
        }) : <Text style={styles.body}>No attachments provided.</Text>}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{stageLabel}</Text>
        <Text style={styles.approvalMeta}>
          {approval
            ? `${approval.approvedCount} of ${approval.totalCount} approved`
            : `Step ${document.currentStep} of ${document.totalSteps}`}
        </Text>

        {canReview ? (
          <>
            {document.permissions.can_approve ? (
              <View style={styles.actionSection}>
                <View style={styles.actionHeading}>
                  <Ionicons color={colors.success} name="checkmark-circle-outline" size={20} />
                  <Text style={styles.actionTitle}>Approve Proposal</Text>
                </View>
                <AppButton
                  label="Approve"
                  loading={isUpdating}
                  onPress={() => confirmAction('approve')}
                />
              </View>
            ) : null}

            {document.permissions.can_request_revision ? (
              <View style={[styles.actionSection, styles.dividedSection]}>
                <View style={styles.actionHeading}>
                  <Ionicons color={colors.warning} name="return-down-back-outline" size={20} />
                  <Text style={styles.actionTitle}>Return for Revision</Text>
                </View>
                <TextInput
                  maxLength={2000}
                  multiline
                  onChangeText={setRemarks}
                  placeholder="Explain what needs to be revised..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.remarks}
                  textAlignVertical="top"
                  value={remarks}
                />
                <Text style={styles.optionalLabel}>Sections needing revision (optional)</Text>
                {revisionSections.map((section) => {
                  const isSelected = selectedSections.includes(section);
                  return (
                    <View key={section} style={styles.revisionItem}>
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        onPress={() => toggleSection(section)}
                        style={styles.flagRow}
                      >
                        <Ionicons
                          color={isSelected ? colors.primary : colors.textMuted}
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={22}
                        />
                        <Text style={styles.flagText}>{section}</Text>
                      </Pressable>
                      {isSelected ? (
                        <TextInput
                          maxLength={2000}
                          multiline
                          onChangeText={(note) => setSectionNotes((current) => ({
                            ...current,
                            [section]: note,
                          }))}
                          placeholder={`Note specific to ${section} (optional)...`}
                          placeholderTextColor={colors.textMuted}
                          style={[styles.remarks, styles.sectionRemarks]}
                          textAlignVertical="top"
                          value={sectionNotes[section] ?? ''}
                        />
                      ) : null}
                    </View>
                  );
                })}
                <AppButton
                  disabled={!remarks.trim()}
                  label="Return for Revision"
                  loading={isUpdating}
                  onPress={() => confirmAction('revision')}
                  style={styles.returnButton}
                  variant="secondary"
                />
              </View>
            ) : null}

            {document.permissions.can_reject ? (
              <View style={[styles.actionSection, styles.dividedSection]}>
                <View style={styles.actionHeading}>
                  <Ionicons color={colors.danger} name="close-circle-outline" size={20} />
                  <Text style={styles.rejectTitle}>Reject Proposal</Text>
                </View>
                <TextInput
                  maxLength={2000}
                  multiline
                  onChangeText={setRejectRemarks}
                  placeholder="Explain why this proposal is being rejected..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.remarks}
                  textAlignVertical="top"
                  value={rejectRemarks}
                />
                <AppButton
                  disabled={!rejectRemarks.trim()}
                  label="Reject"
                  loading={isUpdating}
                  onPress={() => confirmAction('reject')}
                  style={styles.destructiveButton}
                  variant="danger"
                />
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.body}>No action is currently required from you.</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Revision History</Text>
        {document.history.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineRail}>
              <View style={styles.timelineDot} />
              {index < document.history.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.historyAction}>{item.action}</Text>
              <Text style={styles.body}>{item.stageLabel ?? item.stage}</Text>
              <Text style={styles.body}>{item.actorName} · {item.actorRole}</Text>
              <Text style={styles.historyTime}>{formatDateTime(item.timestamp)}</Text>
              {item.remarks ? <Text style={styles.historyRemarks}>{item.remarks}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.accent,
    ...typography.label,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  organization: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    ...typography.supporting,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  documentId: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginBottom: spacing.sm,
  },
  summaryCard: {
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: spacing.lg,
  },
  summaryAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.info,
  },
  cardEyebrow: {
    color: colors.info,
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: colors.text,
    ...typography.cardTitle,
  },
  summaryMeta: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: 12,
  },
  summaryTitle: {
    marginTop: spacing.md,
    color: colors.text,
    ...typography.cardTitle,
  },
  summaryDate: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  infoField: {
    marginTop: spacing.sm,
  },
  fieldLabel: {
    color: colors.textMuted,
    ...typography.label,
    fontWeight: '600',
  },
  fieldValue: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.supporting,
  },
  narrativeSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  body: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    ...typography.supporting,
  },
  bullet: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    ...typography.supporting,
  },
  flowItem: {
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.primarySoft,
  },
  flowActivity: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  flowDuration: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: 13,
  },
  expenseItem: {
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  personItem: {
    marginTop: spacing.sm,
  },
  personName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  attachmentRow: {
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attachmentHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attachmentIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentCopy: {
    flex: 1,
  },
  attachmentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  attachmentMeta: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: 12,
  },
  attachmentAction: {
    minHeight: 44,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  attachmentActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
  disabledAction: {
    opacity: 0.45,
  },
  approvalMeta: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: 13,
  },
  actionSection: {
    marginTop: spacing.lg,
  },
  dividedSection: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  remarks: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: colors.background,
  },
  optionalLabel: {
    marginTop: spacing.md,
    color: colors.textMuted,
    ...typography.label,
  },
  revisionItem: {
    marginTop: spacing.xs,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  flagText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  sectionRemarks: {
    minHeight: 64,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
  returnButton: {
    marginTop: spacing.md,
  },
  rejectTitle: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  destructiveButton: {
    marginTop: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 68,
    marginTop: spacing.md,
  },
  timelineRail: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 9,
    height: 9,
    marginTop: 5,
    borderRadius: radius.full,
    backgroundColor: colors.info,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: spacing.xxs,
    backgroundColor: colors.border,
  },
  timelineCopy: {
    flex: 1,
    paddingLeft: spacing.xs,
  },
  historyAction: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  historyTime: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: 12,
  },
  historyRemarks: {
    marginTop: spacing.xs,
    color: colors.text,
    ...typography.supporting,
  },
});
