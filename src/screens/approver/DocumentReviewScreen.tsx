import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, radius, spacing } from '../../constants/theme';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import { approveActivityProposal, getActivityProposal, rejectActivityProposal, requestActivityProposalRevision } from '../../services/documentService';
import type { Document } from '../../types/document';
import { formatDate, formatDateTime } from '../../utils/date';

type Props = NativeStackScreenProps<ApproverStackParamList, 'DocumentReview'>;

const STAGE_LABELS: Record<Document['currentStage'], string> = {
  submitted: 'Submitted', adviser_review: 'Adviser Review', program_chair_review: 'Program Chair Review', completed: 'Completed', rejected: 'Rejected',
};

const DEFAULT_REVISION_SECTIONS = ['RSO Info', 'Activity Details', 'Partner Orgs & SDG', 'Budget', 'Schedule & Venue', 'Objectives', 'Activity Description', 'Responsible Persons', 'General'];

function formatCurrency(value?: number) {
  return value === undefined ? '-' : `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <View style={styles.infoField}><Text style={styles.fieldLabel}>{label}</Text><Text style={styles.fieldValue}>{value}</Text></View>;
}

export default function DocumentReviewScreen({ navigation, route }: Props) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    getActivityProposal(route.params.documentId).then((item) => { if (isMounted) setDocument(item); }).catch(() => { if (isMounted) setDocument(null); }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [route.params.documentId]);

  async function handleAction(action: 'approve' | 'revision' | 'reject') {
    if (!document) return;
    try {
      setIsUpdating(true);
      const revisionRemarks = [
        remarks || 'Please review the requested changes before resubmitting.',
        selectedSections.length ? `Sections needing revision: ${selectedSections.join(', ')}` : '',
      ].filter(Boolean).join('\n\n');
      const updatedDocument = action === 'approve'
        ? await approveActivityProposal(document.id)
        : action === 'revision'
          ? await requestActivityProposalRevision(document.id, revisionRemarks)
          : await rejectActivityProposal(document.id, remarks || 'This request was rejected for review.');
      setDocument(await getActivityProposal(updatedDocument.id));
      setRemarks('');
      setSelectedSections([]);
      Alert.alert('Review submitted', 'The Activity Proposal was updated successfully.');
    } catch (caught) {
      Alert.alert('Action failed', caught instanceof Error ? caught.message : 'Unable to update the document.');
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

  if (isLoading) return <Screen scroll><Text style={styles.emptyText}>Loading Activity Proposal...</Text></Screen>;
  if (!document) return <Screen scroll><Text style={styles.emptyText}>Unable to load this Activity Proposal.</Text></Screen>;

  const details = document.activityProposal;
  const approval = details?.approval;
  const canReview = document.permissions.can_approve || document.permissions.can_request_revision || document.permissions.can_reject;
  const revisionSections = details?.revisionSections ?? DEFAULT_REVISION_SECTIONS;

  return (
    <Screen scroll>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons color={colors.primary} name="arrow-back" size={20} /><Text style={styles.backText}>Back</Text></Pressable>
      <Text style={styles.kicker}>Activity Proposal</Text>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.organization}>{document.organizationName}</Text>
      <View style={styles.statusRow}><StatusBadge status={document.status} /><Text style={styles.documentId}>{document.id}</Text></View>

      {details ? <Card style={{ ...styles.card, ...styles.summaryCard }}><View style={styles.summaryAccent} /><Text style={styles.cardTitle}>Activity</Text><Text style={styles.summaryMeta}>{details.venue ? `On Calendar · ${details.venue}` : 'Activity details'}</Text><Text style={styles.summaryTitle}>{document.title}</Text><Text style={styles.summaryDate}>{details.startsAt ? formatDate(details.startsAt) : 'Date not provided'}{details.startsAt && details.endsAt ? ` · ${formatDate(details.startsAt, 'h:mm A')}–${formatDate(details.endsAt, 'h:mm A')}` : ''}</Text></Card> : null}

      {details ? <Card style={styles.card}><Text style={styles.cardTitle}>Activity Request Form</Text><InfoField label="Nature of Activity" value={details.natureOfActivity} /><InfoField label="Type of Activity" value={details.typeOfActivity} /><InfoField label="Partner Organization(s) / School(s) / RSO" value={details.partnerOrganizations?.join('\n')} /><InfoField label="Target SDG" value={details.targetSdgs?.join('\n')} /><InfoField label="Proposed Budget" value={formatCurrency(details.proposedBudget)} /><InfoField label="Budget Source" value={details.budgetSource} /></Card> : null}

      <Card style={styles.card}><Text style={styles.cardTitle}>Proposal Narrative</Text>{details?.objectives?.length ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Objectives</Text>{details.objectives.map((objective) => <Text key={objective} style={styles.bullet}>• {objective}</Text>)}</View> : null}<View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Activity Description</Text><Text style={styles.body}>{details?.activityDescription ?? document.description}</Text></View>{details?.criteriaMechanics ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Criteria / Mechanics</Text><Text style={styles.body}>{details.criteriaMechanics}</Text></View> : null}{details?.programFlow?.length ? <View style={styles.narrativeSection}><Text style={styles.sectionTitle}>Program Flow</Text>{details.programFlow.map((item) => <View key={`${item.activity}-${item.duration}`} style={styles.flowItem}><Text style={styles.flowActivity}>{item.activity}</Text>{item.duration ? <Text style={styles.flowDuration}>{item.duration}</Text> : null}</View>)}</View> : null}</Card>

      {details?.expenses?.length ? <Card style={styles.card}><Text style={styles.cardTitle}>Expenses</Text>{details.expenses.map((expense) => <View key={`${expense.material}-${expense.quantity}`} style={styles.expenseItem}><Text style={styles.expenseTitle}>{expense.material}</Text><InfoField label="Quantity" value={String(expense.quantity)} /><InfoField label="Unit Price" value={formatCurrency(expense.unitPrice)} /><InfoField label="Total" value={formatCurrency(expense.total)} /></View>)}<View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValue}>{formatCurrency(details.expenses.reduce((sum, expense) => sum + expense.total, 0))}</Text></View></Card> : null}

      {details?.responsiblePersons?.length ? <Card style={styles.card}><Text style={styles.cardTitle}>Responsible Person(s)</Text>{details.responsiblePersons.map((person) => <View key={`${person.name}-${person.role}`} style={styles.personItem}><Text style={styles.personName}>{person.name}</Text><Text style={styles.body}>{person.role}</Text></View>)}</Card> : null}

      <Card style={styles.card}><Text style={styles.cardTitle}>Attachments</Text>{document.attachments.length ? document.attachments.map((attachment) => <View key={attachment.id} style={styles.attachmentRow}><Text style={styles.attachmentName}>{attachment.fileName}</Text><Text style={styles.body}>{attachment.description ?? `${attachment.fileType} · ${attachment.sizeLabel}`}</Text></View>) : <Text style={styles.body}>No attachments provided.</Text>}</Card>

      <Card style={styles.card}><Text style={styles.cardTitle}>{approval?.stageLabel ?? STAGE_LABELS[document.currentStage]}</Text><Text style={styles.approvalMeta}>{approval ? `${approval.approvedCount} / ${approval.totalCount} approved` : `Step ${document.currentStep} of ${document.totalSteps}`}</Text>{canReview ? <>{document.permissions.can_approve ? <View style={styles.actionSection}><Text style={styles.actionTitle}>✓ Approve</Text><AppButton label="Approve" loading={isUpdating} onPress={() => confirmAction('approve')} /></View> : null}{document.permissions.can_request_revision ? <View style={[styles.actionSection, styles.dividedSection]}><Text style={styles.actionTitle}>↩ Return for Revision</Text><TextInput multiline onChangeText={setRemarks} placeholder="Explain what the student needs to revise..." placeholderTextColor={colors.textMuted} style={styles.remarks} textAlignVertical="top" value={remarks} /><Text style={styles.optionalLabel}>Flag sections needing revision (optional)</Text>{revisionSections.map((section) => <Pressable key={section} onPress={() => toggleSection(section)} style={styles.flagRow}><Ionicons color={selectedSections.includes(section) ? colors.primary : colors.textMuted} name={selectedSections.includes(section) ? 'checkbox' : 'square-outline'} size={22} /><Text style={styles.flagText}>{section}</Text></Pressable>)}<AppButton label="Return for Revision" loading={isUpdating} onPress={() => confirmAction('revision')} style={styles.returnButton} variant="ghost" /></View> : null}{document.permissions.can_reject ? <View style={[styles.actionSection, styles.dividedSection]}><Text style={styles.rejectTitle}>⊗ Reject (permanent)</Text><AppButton label="Reject" loading={isUpdating} onPress={() => confirmAction('reject')} variant="danger" /></View> : null}</> : <Text style={styles.body}>No action is currently required from you.</Text>}</Card>

      <Card style={styles.card}><Text style={styles.cardTitle}>Revision History</Text>{document.history.map((item, index) => <View key={item.id} style={styles.timelineItem}><View style={styles.timelineRail}><View style={styles.timelineDot} />{index < document.history.length - 1 ? <View style={styles.timelineLine} /> : null}</View><View style={styles.timelineCopy}><Text style={styles.historyAction}>{item.action}</Text><Text style={styles.body}>{item.actorName} · {item.actorRole}</Text><Text style={styles.historyTime}>{formatDateTime(item.timestamp)}</Text>{item.remarks ? <Text style={styles.body}>{item.remarks}</Text> : null}</View></View>)}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }, backText: { color: colors.primary, fontWeight: '700' }, kicker: { color: colors.textMuted, fontSize: 13, fontWeight: '700' }, title: { marginTop: 4, color: colors.text, fontSize: 22, fontWeight: '800' }, organization: { marginTop: 5, color: colors.textMuted, fontSize: 14 }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 16 }, documentId: { color: colors.textMuted, fontSize: 12 }, card: { marginBottom: 14, padding: spacing.md }, summaryCard: { position: 'relative', overflow: 'hidden', paddingLeft: 20 }, summaryAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.info }, cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' }, summaryMeta: { marginTop: 4, color: colors.textMuted, fontSize: 12 }, summaryTitle: { marginTop: 20, color: colors.text, fontSize: 17, fontWeight: '700' }, summaryDate: { marginTop: 5, color: colors.textMuted, fontSize: 13 }, infoField: { marginTop: 14 }, fieldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' }, fieldValue: { marginTop: 4, color: colors.text, fontSize: 14, lineHeight: 20 }, narrativeSection: { marginTop: 18 }, sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800' }, body: { marginTop: 5, color: colors.textMuted, fontSize: 14, lineHeight: 20 }, bullet: { marginTop: 10, color: colors.textMuted, fontSize: 14, lineHeight: 20 }, flowItem: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.primarySoft }, flowActivity: { color: colors.text, fontSize: 14, fontWeight: '600' }, flowDuration: { marginTop: 3, color: colors.textMuted, fontSize: 13 }, expenseItem: { marginTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, expenseTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }, totalLabel: { color: colors.text, fontWeight: '800' }, totalValue: { color: colors.text, fontSize: 16, fontWeight: '800' }, personItem: { marginTop: 16 }, personName: { color: colors.text, fontSize: 14, fontWeight: '700' }, attachmentRow: { marginTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, attachmentName: { color: colors.text, fontSize: 14, fontWeight: '700' }, approvalMeta: { marginTop: 5, color: colors.textMuted, fontSize: 13 }, actionSection: { marginTop: 20 }, dividedSection: { paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }, actionTitle: { marginBottom: 10, color: colors.text, fontSize: 14, fontWeight: '800' }, remarks: { minHeight: 104, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, color: colors.text, fontSize: 14, backgroundColor: colors.background }, optionalLabel: { marginTop: 16, color: colors.textMuted, fontSize: 12, fontWeight: '700' }, flagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, marginTop: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }, flagText: { flex: 1, color: colors.text, fontSize: 13 }, returnButton: { marginTop: 14, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }, rejectTitle: { marginBottom: 10, color: colors.danger, fontSize: 14, fontWeight: '800' }, timelineItem: { flexDirection: 'row', minHeight: 72, marginTop: 16 }, timelineRail: { width: 20, alignItems: 'center' }, timelineDot: { width: 10, height: 10, marginTop: 4, borderRadius: 5, backgroundColor: colors.info }, timelineLine: { flex: 1, width: 1, marginTop: 5, backgroundColor: colors.border }, timelineCopy: { flex: 1, paddingLeft: 8 }, historyAction: { color: colors.text, fontSize: 14, fontWeight: '800' }, historyTime: { marginTop: 4, color: colors.textMuted, fontSize: 12 }, emptyText: { color: colors.textMuted, fontSize: 15 },
});