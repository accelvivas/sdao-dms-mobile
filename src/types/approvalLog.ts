export type ApprovalLogAction = 'approved' | 'returned' | 'rejected';

export type ApprovalLog = {
  id: string;
  proposalReference: string;
  proposalTitle: string;
  action: ApprovalLogAction;
  approver: {
    id: string;
    name: string;
    role: string;
  };
  fromStatus: string | null;
  toStatus: string;
  fromStage: string;
  toStage: string;
  remarks: string | null;
  createdAt: string;
};

export type ApprovalLogFilters = {
  search?: string;
  action?: ApprovalLogAction;
  dateFrom?: string;
  dateTo?: string;
};

export type ApprovalLogPage = {
  logs: ApprovalLog[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};
