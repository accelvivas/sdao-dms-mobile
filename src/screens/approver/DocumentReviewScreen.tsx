import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import { downloadProposalAttachment } from '../../services/attachmentService';
import { approveActivityProposal, getActivityProposal, rejectActivityProposal, requestActivityProposalRevision } from '../../services/documentService';
import type { Document } from '../../types/document';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';
import { formatDate, formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted', adviser_review: 'Adviser Review', program_chair_review: 'Program Chair Review', completed: 'Completed', rejected: 'Rejected',
};

function formatCurrency(value?: number) {
  return value === undefined ? '-' : `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <View style={styles.infoField}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.fieldValue}>{value}</Text></View>;
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
    } catch (error) {
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
      setIsUpdating(true);
      const validSections = document.activityProposal?.revisionSections ?? [];
      const requestedSections = selectedSections.filter((section) => validSections.includes(section));
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
    } catch (caught) {
      const status = getApiErrorStatus(caught);
      if (status === 401) {
        await logout();
        return;
      }
      if (status === 403) {
        try {
          setDocument(await getActivityProposal(document.id));
          Alert.alert('Proposal updated', 'This proposal is no longer at your stage. The current state has been loaded.');
        } catch (refreshError) {
          if (getApiErrorStatus(refreshError) === 401) {
            await logout();
            return;
          }
          Alert.alert('Proposal changed', getApiErrorMessage(refreshError, 'This proposal is no longer at your stage, and its current state could not be loaded.'));
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
    const messages = { approve: 'Are you sure you want to approve this Activity Proposal?', revision: 'Are you sure you want to return this Activity Proposal for revision?', reject: 'Are you sure you want to reject this Activity Proposal?' };
    Alert.alert('Confirm review action', messages[action], [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', style: action === 'reject' ? 'destructive' : 'default', onPress: () => void handleAction(action) }]);
  }

  function toggleSection(section: string) {
    setSelectedSections((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  }

  async function handleOpenAttachment(attachment: Document['attachments'][number]) {
    if (!document || openingAttachmentId) return;
    const attachmentId = String(attachment.id);
    setOpeningAttachmentId(attachmentId);
    try {
      const downloadedAttachment = await downloadProposalAttachment(document.id, attachment);
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Opening downloaded files is not available on this device.');
      }
      await Sharing.shareAsync(downloadedAttachment.uri, {
        dialogTitle: `Open ${downloadedAttachment.fileName}`,
        mimeType: downloadedAttachment.mimeType,
      });
    } catch (error) {
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
      setOpeningAttachmentId(null);
    }
  }

  if (isLoading) return <Screen scroll><Text style={styles.emptyText}>Loading Activity Proposal...</Text></Screen>;
  if (!document) return <Screen scroll><Text style={styles.emptyText}>{loadError || 'Unable to load this Activity Proposal.'}</Text><AppButton label="Retry" onPress={() => void loadDocument()} style={styles.returnButton} variant="secondary" /></Screen>;

  const details = document.activityProposal;
  const approval = details?.approval;
  const canReview = document.permissions.can_act;
  const revisionSections = details?.revisionSections ?? [];

  return (
    <Screen scroll>
      <Text style={styles.kicker}>Activity Proposal</Text>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.organization}>{document.organizationName}</Text>
      <View style={styles.statusRow}><StatusBadge status={document.status} /><Text style={styles.documentId}>{document.id}</Text></View>

      {details ? <Card style={{ ...styles.card, ...styles.summaryCard }}><View style={styles.summaryAccent} /><Text style={styles.cardTitle}>Activity</Text><Text style={styles.summaryMeta}>{details.venue ? `On Calendar · ${details.venue}` : 'Activity details'}</Text><Text style={styles.summaryTitle}>{document.title}</Text><Text style={styles.summaryDate}>{details.startsAt ? formatDate(details.startsAt) : 'Date not provided'}{details.startsAt && details.endsAt ? ` · ${formatDate(details.startsAt, 'h:mm A')}–${formatDate(details.endsAt, 'h:mm A')}` : ''}</Text></Card> : null}

      {details ? <Card style={styles.card}><Text style={styles.cardTitle}>Activity Request Form</Text><InfoField label="Nature of Activity" value={details.natureOfActivity} /><InfoField label="Type of Activity" value={details.typeOfActivity} /><InfoField label="Partner Organization(s) / School(s) / RSO" value={details.partnerOrganizations?.join('\n')} /><InfoField label="Target SDG" value={details.targetSdgs?.join('\n')} /><InfoField label="Proposed Budget" value={formatCurrency(details.proposedBudget)} /><InfoField label="Budget Source" value={details.budgetSource} /></Card> : null}

      <Card style={styles.card}><Text style={styles.cardTitle}>Proposal Narrative</Text>{details?.objectives?.length ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Objectives</Text>{details.objectives.map((objective) => <Text key={objective} style={styles.bullet}>• {objective}</Text>)}</View> : null}<View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Activity Description</Text><Text style={styles.body}>{details?.activityDescription ?? document.description}</Text></View>{details?.criteriaMechanics ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Criteria / Mechanics</Text><Text style={styles.body}>{details.criteriaMechanics}</Text></View> : null}{details?.programFlow?.length ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Program Flow</Text>{details.programFlow.map((item) => <View key={`${item.activity}-${item.duration}`} style={styles.flowItem}><Text style={styles.flowActivity}>{item.activity}</Text>{item.duration ? <Text style={styles.flowDuration}>{item.duration}</Text> : null}</View>)}</View> : null}</Card>

      {details?.expenses?.length ? <Card style={styles.card}><Text style={styles.cardTitle}>Expenses</Text>{details.expenses.map((expense) => <View key={`${expense.material}-${expense.quantity}`} style={styles.expenseItem}><Text style={styles.expenseTitle}>{expense.material}</Text><InfoField label="Quantity" value={String(expense.quantity)} /><InfoField label="Unit Price" value={formatCurrency(expense.unitPrice)} /><InfoField label="Total" value={formatCurrency(expense.total)} /></View>)}<View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValue}>{formatCurrency(details.expenses.reduce((sum, expense) => sum + expense.total, 0))}</Text></View></Card> : null}

      {details?.responsiblePersons?.length ? <Card style={styles.card}><Text style={styles.cardTitle}>Responsible Person(s)</Text>{details.responsiblePersons.map((person) => <View key={`${person.name}-${person.role}`} style={styles.personItem}><Text style={styles.personName}>{person.name}</Text><Text style={styles.body}>{person.role}</Text></View>)}</Card> : null}

      <Card style={styles.card}><Text style={styles.cardTitle}>Attachments</Text>{document.attachments.length ? document.attachments.map((attachment) => { const attachmentId = String(attachment.id); return <View key={attachmentId} style={styles.attachmentRow}><Text style={styles.attachmentName}>{attachment.fileName}</Text><Text style={styles.body}>{attachment.fileType} · {attachment.sizeLabel}</Text>{attachment.description ? <Text style={styles.body}>{attachment.description}</Text> : null}<Pressable accessibilityRole="button" disabled={openingAttachmentId !== null} onPress={() => void handleOpenAttachment(attachment)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginTop: 8, opacity: openingAttachmentId !== null && openingAttachmentId !== attachmentId ? 0.5 : 1 }}><Ionicons color={colors.primary} name="download-outline" size={20} />{openingAttachmentId === attachmentId ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Download / Open</Text>}</Pressable></View>; }) : <Text style={styles.body}>No attachments provided.</Text>}</Card>

      <Card style={styles.card}><Text style={styles.cardTitle}>{document.currentStageLabel ?? approval?.stageLabel ?? STAGE_LABELS[document.currentStage] ?? document.currentStage}</Text><Text style={styles.approvalMeta}>{approval ? `${approval.approvedCount} / ${approval.totalCount} approved` : `Step ${document.currentStep} of ${document.totalSteps}`}</Text>{canReview ? <>{document.permissions.can_approve ? <View style={styles.actionSection}><Text style={styles.actionTitle}>✓ Approve</Text><AppButton label="Approve" loading={isUpdating} onPress={() => confirmAction('approve')} /></View> : null}{document.permissions.can_request_revision ? <View style={[styles.actionSection, styles.dividedSection]}><Text style={styles.actionTitle}>↩ Return for Revision</Text><TextInput maxLength={2000} multiline onChangeText={setRemarks} placeholder="Explain what the student needs to revise..." placeholderTextColor={colors.textMuted} style={styles.remarks} textAlignVertical="top" value={remarks} /><Text style={styles.optionalLabel}>Flag sections needing revision (optional)</Text>{revisionSections.map((section) => <View key={section} style={{ marginTop: 8 }}><Pressable onPress={() => toggleSection(section)} style={styles.flagRow}><Ionicons color={selectedSections.includes(section) ? colors.primary : colors.textMuted} name={selectedSections.includes(section) ? 'checkbox' : 'square-outline'} size={22} /><Text style={styles.flagText}>{section}</Text></Pressable>{selectedSections.includes(section) ? <TextInput maxLength={2000} multiline onChangeText={(note) => setSectionNotes((current) => ({ ...current, [section]: note }))} placeholder={`Note specific to ${section} (optional)...`} placeholderTextColor={colors.textMuted} style={[styles.remarks, { minHeight: 64, marginLeft: 28, marginTop: 8 }]} textAlignVertical="top" value={sectionNotes[section] ?? ''} /> : null}</View>)}<AppButton label="Return for Revision" disabled={!remarks.trim()} loading={isUpdating} onPress={() => confirmAction('revision')} style={styles.returnButton} variant="ghost" /></View> : null}{document.permissions.can_reject ? <View style={[styles.actionSection, styles.dividedSection]}><Text style={styles.rejectTitle}>⊗ Reject (permanent)</Text><TextInput maxLength={2000} multiline onChangeText={setRejectRemarks} placeholder="Explain why this proposal is being rejected..." placeholderTextColor={colors.textMuted} style={styles.remarks} textAlignVertical="top" value={rejectRemarks} /><AppButton label="Reject" disabled={!rejectRemarks.trim()} loading={isUpdating} onPress={() => confirmAction('reject')} variant="danger" /></View> : null}</> : <Text style={styles.body}>No action is currently required from you.</Text>}</Card>

      <Card style={styles.card}><Text style={styles.cardTitle}>Revision History</Text>{document.history.map((item, index) => <View key={item.id} style={styles.timelineItem}><View style={styles.timelineRail}><View style={styles.timelineDot} />{index < document.history.length - 1 ? <View style={styles.timelineLine} /> : null}</View><View style={styles.timelineCopy}><Text style={styles.historyAction}>{item.action}</Text><Text style={styles.body}>{item.stageLabel ?? item.stage}</Text><Text style={styles.body}>{item.actorName} · {item.actorRole}</Text><Text style={styles.historyTime}>{formatDateTime(item.timestamp)}</Text>{item.remarks ? <Text style={styles.body}>{item.remarks}</Text> : null}</View></View>)}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }, backText: { color: colors.primary, fontWeight: '700' }, kicker: { color: colors.textMuted, fontSize: 13, fontWeight: '700' }, title: { marginTop: 4, color: colors.text, fontSize: 22, fontWeight: '800' }, organization: { marginTop: 5, color: colors.textMuted, fontSize: 14 }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 16 }, documentId: { color: colors.textMuted, fontSize: 12 }, card: { marginBottom: 14, padding: spacing.md }, summaryCard: { position: 'relative', overflow: 'hidden', paddingLeft: 20 }, summaryAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.info }, cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' }, summaryMeta: { marginTop: 4, color: colors.textMuted, fontSize: 12 }, summaryTitle: { marginTop: 20, color: colors.text, fontSize: 17, fontWeight: '700' }, summaryDate: { marginTop: 5, color: colors.textMuted, fontSize: 13 }, infoField: { marginTop: 14 }, fieldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' }, fieldValue: { marginTop: 4, color: colors.text, fontSize: 14, lineHeight: 20 }, narrativeSection: { marginTop: 18 }, sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800' }, body: { marginTop: 5, color: colors.textMuted, fontSize: 14, lineHeight: 20 }, bullet: { marginTop: 10, color: colors.textMuted, fontSize: 14, lineHeight: 20 }, flowItem: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.primarySoft }, flowActivity: { color: colors.text, fontSize: 14, fontWeight: '600' }, flowDuration: { marginTop: 3, color: colors.textMuted, fontSize: 13 }, expenseItem: { marginTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, expenseTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }, totalLabel: { color: colors.text, fontWeight: '800' }, totalValue: { color: colors.text, fontSize: 16, fontWeight: '800' }, personItem: { marginTop: 16 }, personName: { color: colors.text, fontSize: 14, fontWeight: '700' }, attachmentRow: { marginTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, attachmentName: { color: colors.text, fontSize: 14, fontWeight: '700' }, approvalMeta: { marginTop: 5, color: colors.textMuted, fontSize: 13 }, actionSection: { marginTop: 20 }, dividedSection: { paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }, actionTitle: { marginBottom: 10, color: colors.text, fontSize: 14, fontWeight: '800' }, remarks: { minHeight: 104, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, color: colors.text, fontSize: 14, backgroundColor: colors.background }, optionalLabel: { marginTop: 16, color: colors.textMuted, fontSize: 12, fontWeight: '700' }, flagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, marginTop: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }, flagText: { flex: 1, color: colors.text, fontSize: 13 }, returnButton: { marginTop: 14, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }, rejectTitle: { marginBottom: 10, color: colors.danger, fontSize: 14, fontWeight: '800' }, timelineItem: { flexDirection: 'row', minHeight: 72, marginTop: 16 }, timelineRail: { width: 20, alignItems: 'center' }, timelineDot: { width: 10, height: 10, marginTop: 4, borderRadius: 5, backgroundColor: colors.info }, timelineLine: { flex: 1, width: 1, marginTop: 5, backgroundColor: colors.border }, timelineCopy: { flex: 1, paddingLeft: 8 }, historyAction: { color: colors.text, fontSize: 14, fontWeight: '800' }, historyTime: { marginTop: 4, color: colors.textMuted, fontSize: 12 }, emptyText: { color: colors.textMuted, fontSize: 15 },
});