import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { AppTextField } from '../../components/AppTextField';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import {
  getApprovalLogs,
  subscribeToApprovalLogInvalidation,
} from '../../services/approvalLogService';
import type {
  ApprovalLog,
  ApprovalLogAction,
  ApprovalLogFilters,
} from '../../types/approvalLog';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<ApproverTabParamList, 'ApprovalLogs'>,
  NativeStackNavigationProp<ApproverStackParamList>
>;

const ACTIONS: Array<{ value: ApprovalLogAction; label: string }> = [
  { value: 'approved', label: 'Approved' },
  { value: 'returned', label: 'Returned' },
  { value: 'rejected', label: 'Rejected' },
];

const ACTION_DETAILS: Record<ApprovalLogAction, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}> = {
  approved: {
    label: 'Approved',
    icon: 'checkmark-circle-outline',
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  returned: {
    label: 'Returned for Revision',
    icon: 'return-down-back-outline',
    color: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  rejected: {
    label: 'Rejected',
    icon: 'close-circle-outline',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
};

const STAGE_LABELS: Record<string, string> = {
  adviser_review: 'Adviser Review',
  program_chair_review: 'Program Chair Review',
  dean_review: 'Dean Review',
  principal_review: 'Principal Review',
  sdao_review: 'SDAO Review',
  assistant_director_review: 'Assistant Director Review',
  academic_director_review: 'Academic Director Review',
  executive_director_review: 'Executive Director Review',
  completed: 'Completed',
  rejected: 'Rejected',
};

function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function parseFilterDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(`${year.toString().padStart(4, '0')}-${month
    .toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00+08:00`);
}

function formatFilterDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function toManilaDateParameter(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function DateFilterField({
  label,
  value,
  isOpen,
  onChange,
  onOpen,
  onClose,
  minimumValue,
  maximumValue,
}: {
  label: string;
  value: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  minimumValue?: string;
  maximumValue?: string;
}) {
  const minimumDate = parseFilterDate(minimumValue);
  const maximumDate = parseFilterDate(maximumValue);
  let pickerValue = parseFilterDate(value) ?? new Date();
  if (minimumDate && pickerValue < minimumDate) pickerValue = minimumDate;
  if (maximumDate && pickerValue > maximumDate) pickerValue = maximumDate;

  function handleValueChange(_event: DateTimePickerChangeEvent, selectedDate: Date) {
    if (Platform.OS === 'android') onClose();
    onChange(toManilaDateParameter(selectedDate));
  }

  return (
    <View>
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={[styles.dateControl, isOpen && styles.dateControlFocused]}>
        <Pressable
          accessibilityLabel={`${label}${value ? `, selected ${formatFilterDate(value)}` : ''}`}
          accessibilityRole="button"
          onPress={onOpen}
          style={styles.dateButton}
        >
          <Ionicons color={colors.primary} name="calendar-outline" size={20} />
          <Text style={[styles.dateValue, !value && styles.datePlaceholder]}>
            {value ? formatFilterDate(value) : 'Select date'}
          </Text>
        </Pressable>
        {value ? (
          <Pressable
            accessibilityLabel={`Clear ${label.toLowerCase()}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              onChange('');
              onClose();
            }}
            style={styles.clearDateButton}
          >
            <Ionicons color={colors.textMuted} name="close-circle" size={20} />
          </Pressable>
        ) : null}
      </View>
      {isOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          display="calendar"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode="date"
          onDismiss={onClose}
          onValueChange={handleValueChange}
          timeZoneName="Asia/Manila"
          value={pickerValue}
        />
      ) : null}
      {isOpen && Platform.OS === 'ios' ? (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            display="inline"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            mode="date"
            onDismiss={onClose}
            onValueChange={handleValueChange}
            themeVariant="light"
            timeZoneName="Asia/Manila"
            value={pickerValue}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.pickerDoneButton}
          >
            <Text style={styles.pickerDoneText}>Done</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ApprovalLogCard({ log, onPress }: { log: ApprovalLog; onPress: () => void }) {
  const action = ACTION_DETAILS[log.action];

  return (
    <Pressable
      accessibilityLabel={`Open ${log.proposalReference}, ${log.proposalTitle}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.actionIcon, { backgroundColor: action.backgroundColor }]}>
            <Ionicons color={action.color} name={action.icon} size={20} />
          </View>
          <View style={styles.logHeadingCopy}>
            <Text style={styles.proposalReference}>{log.proposalReference}</Text>
            <Text numberOfLines={2} style={styles.proposalTitle}>{log.proposalTitle}</Text>
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={19} />
        </View>

        <View style={[styles.actionBadge, { backgroundColor: action.backgroundColor }]}>
          <Text style={[styles.actionBadgeText, { color: action.color }]}>{action.label}</Text>
        </View>

        <View style={styles.stageRow}>
          <Text style={styles.stageText}>{stageLabel(log.fromStage)}</Text>
          <Ionicons color={colors.textMuted} name="arrow-forward" size={15} />
          <Text style={styles.stageText}>{stageLabel(log.toStage)}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Ionicons color={colors.textMuted} name="person-outline" size={16} />
          <Text style={styles.metaText}>{log.approver.name} · {log.approver.role}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons color={colors.textMuted} name="time-outline" size={16} />
          <Text style={styles.metaText}>{formatDateTime(log.createdAt)}</Text>
        </View>
        {log.remarks ? (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <Text style={styles.remarksText}>{log.remarks}</Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default function ApprovalLogsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<Navigation>();
  const isFocused = useIsFocused();
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<ApprovalLogAction | undefined>();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openDatePicker, setOpenDatePicker] = useState<'from' | 'to' | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<ApprovalLogFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const loadLogs = useCallback(async (page = 1) => {
    const requestId = ++requestSequence.current;
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');

    try {
      const result = await getApprovalLogs(page, appliedFilters);
      if (requestId !== requestSequence.current) return;
      setLogs((current) => {
        if (page === 1) return result.logs;
        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...result.logs.filter((item) => !existingIds.has(item.id))];
      });
      setCurrentPage(result.currentPage);
      setLastPage(result.lastPage);
      setTotal(result.total);
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        await logout();
        return;
      }
      if (requestId !== requestSequence.current) return;
      setError(getApiErrorMessage(caught, 'Unable to load approval logs. Please try again.'));
    } finally {
      if (requestId === requestSequence.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [appliedFilters, logout]);

  useFocusEffect(
    useCallback(() => {
      void loadLogs();
    }, [loadLogs]),
  );

  useEffect(() => subscribeToApprovalLogInvalidation(() => {
    if (isFocused) void loadLogs();
  }), [isFocused, loadLogs]);

  function applyFilters() {
    setOpenDatePicker(null);
    setAppliedFilters({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(action ? { action } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    });
  }

  function clearFilters() {
    setSearch('');
    setAction(undefined);
    setDateFrom('');
    setDateTo('');
    setOpenDatePicker(null);
    setAppliedFilters({});
  }

  const hasAppliedFilters = Object.keys(appliedFilters).length > 0;

  return (
    <Screen
      onRefresh={() => void loadLogs()}
      refreshing={isLoading && logs.length > 0}
      scroll
    >
      <Text style={styles.kicker}>APPROVAL WORKSPACE</Text>
      <Text style={styles.title}>Approval Logs</Text>
      <Text style={styles.subtitle}>
        Mobile approval actions for proposals you are authorized to view.
      </Text>

      <Card style={styles.filtersCard}>
        <Text style={styles.filterTitle}>Search and filter</Text>
        <AppTextField
          autoCapitalize="none"
          label="Proposal or approver"
          maxLength={100}
          onChangeText={setSearch}
          onSubmitEditing={applyFilters}
          placeholder="Reference, title, or approver name"
          returnKeyType="search"
          rightSlot={<Ionicons color={colors.textMuted} name="search-outline" size={20} />}
          value={search}
        />

        <Text style={styles.fieldLabel}>Action</Text>
        <View style={styles.actionFilters}>
          {ACTIONS.map((item) => {
            const selected = action === item.value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.value}
                onPress={() => setAction((current) => current === item.value ? undefined : item.value)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <DateFilterField
          isOpen={openDatePicker === 'from'}
          label="From date"
          maximumValue={dateTo}
          onChange={setDateFrom}
          onClose={() => setOpenDatePicker(null)}
          onOpen={() => setOpenDatePicker('from')}
          value={dateFrom}
        />
        <DateFilterField
          isOpen={openDatePicker === 'to'}
          label="To date"
          minimumValue={dateFrom}
          onChange={setDateTo}
          onClose={() => setOpenDatePicker(null)}
          onOpen={() => setOpenDatePicker('to')}
          value={dateTo}
        />

        <View style={styles.filterButtons}>
          <AppButton label="Apply filters" onPress={applyFilters} style={styles.applyButton} />
          <AppButton label="Clear" onPress={clearFilters} variant="ghost" />
        </View>
        <Text style={styles.dateNote}>Date filters use Asia/Manila calendar dates.</Text>
      </Card>

      {!isLoading && !error ? (
        <Text style={styles.resultCount}>
          {total} approval log{total === 1 ? '' : 's'}
        </Text>
      ) : null}

      {isLoading ? (
        <Card>
          <EmptyState
            icon="time-outline"
            loading
            message="Fetching mobile approval activity."
            title="Loading approval logs"
          />
        </Card>
      ) : error && logs.length === 0 ? (
        <Card>
          <EmptyState
            actionLabel="Try again"
            icon="cloud-offline-outline"
            message={error}
            onAction={() => void loadLogs()}
            title="Approval logs unavailable"
          />
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <EmptyState
            actionLabel={hasAppliedFilters ? 'Clear filters' : undefined}
            icon="file-tray-outline"
            message={hasAppliedFilters
              ? 'No mobile approval actions match the selected filters.'
              : 'Mobile approval actions will appear here after a proposal is reviewed.'}
            onAction={hasAppliedFilters ? clearFilters : undefined}
            title="No approval logs"
          />
        </Card>
      ) : (
        <>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {logs.map((log) => (
            <ApprovalLogCard
              key={log.id}
              log={log}
              onPress={() => navigation.navigate('DocumentReview', {
                documentId: log.proposalReference,
              })}
            />
          ))}
          {currentPage < lastPage ? (
            <AppButton
              label="Load more"
              loading={isLoadingMore}
              onPress={() => void loadLogs(currentPage + 1)}
              style={styles.loadMoreButton}
              variant="secondary"
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
    color: colors.textMuted,
    ...typography.supporting,
  },
  filtersCard: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterTitle: {
    color: colors.text,
    ...typography.cardTitle,
  },
  fieldLabel: {
    marginBottom: -spacing.xs,
    color: colors.text,
    ...typography.supporting,
    fontWeight: '600',
  },
  actionFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: colors.primary,
  },
  dateLabel: {
    marginBottom: spacing.xs,
    color: colors.text,
    ...typography.supporting,
    fontWeight: '600',
  },
  dateControl: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  dateControlFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  dateButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  dateValue: {
    color: colors.text,
    fontSize: 15,
  },
  datePlaceholder: {
    color: colors.textMuted,
  },
  clearDateButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    marginTop: spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  pickerDoneButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerDoneText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  applyButton: {
    flex: 1,
  },
  dateNote: {
    marginTop: -spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
  },
  resultCount: {
    marginBottom: spacing.sm,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logHeadingCopy: {
    flex: 1,
  },
  proposalReference: {
    color: colors.primary,
    ...typography.label,
  },
  proposalTitle: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.cardTitle,
  },
  actionBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  stageText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
    backgroundColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    flex: 1,
    color: colors.textMuted,
    ...typography.supporting,
  },
  remarksBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  remarksLabel: {
    color: colors.textMuted,
    ...typography.label,
  },
  remarksText: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.supporting,
  },
  pressed: {
    opacity: 0.72,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    ...typography.supporting,
  },
  loadMoreButton: {
    marginTop: spacing.xs,
  },
});
