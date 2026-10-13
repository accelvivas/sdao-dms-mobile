import { apiClient } from '../api/client';
import type {
  ApprovalLog,
  ApprovalLogFilters,
  ApprovalLogPage,
} from '../types/approvalLog';
import { approvalLogPageSchema } from '../validation/apiSchemas';

type InvalidationListener = () => void;

const invalidationListeners = new Set<InvalidationListener>();

export async function getApprovalLogs(
  page = 1,
  filters: ApprovalLogFilters = {},
): Promise<ApprovalLogPage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const search = filters.search?.trim();
  const { data } = await apiClient.get<unknown>('/mobile/approval-logs', {
    params: {
      page: safePage,
      ...(search ? { search } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.dateFrom ? { date_from: filters.dateFrom } : {}),
      ...(filters.dateTo ? { date_to: filters.dateTo } : {}),
    },
  });
  const payload = approvalLogPageSchema.parse(data);

  const logs: ApprovalLog[] = payload.data.map((log) => ({
    id: log.id,
    proposalReference: log.proposal_reference,
    proposalTitle: log.proposal_title,
    action: log.action,
    approver: {
      id: String(log.approver.id),
      name: log.approver.name,
      role: log.approver.role,
    },
    fromStatus: log.from_status,
    toStatus: log.to_status,
    fromStage: log.from_stage,
    toStage: log.to_stage,
    remarks: log.remarks,
    createdAt: log.created_at,
  }));

  return {
    logs,
    currentPage: payload.meta.current_page,
    lastPage: payload.meta.last_page,
    perPage: payload.meta.per_page,
    total: payload.meta.total,
  };
}

export function invalidateApprovalLogs(): void {
  invalidationListeners.forEach((listener) => listener());
}

export function subscribeToApprovalLogInvalidation(
  listener: InvalidationListener,
): () => void {
  invalidationListeners.add(listener);
  return () => invalidationListeners.delete(listener);
}
