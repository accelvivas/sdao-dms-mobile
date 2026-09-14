export type DocumentStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'revision_requested'
  | 'rejected';

export type DocumentType = 'activity_proposal';

export type DocumentStage =
  | 'submitted'
  | 'adviser_review'
  | 'program_chair_review'
  | 'completed'
  | 'rejected';

export type DocumentTransition = {
  id: string;
  action: string;
  stage: DocumentStage;
  actorName: string;
  actorRole: string;
  timestamp: string;
  remarks?: string;
};

export type DocumentPermissions = {
  can_view: boolean;
  can_act: boolean;
  can_review: boolean;
  can_approve: boolean;
  can_request_revision: boolean;
  can_reject: boolean;
};

export type DocumentAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  sizeLabel: string;
};

export type Document = {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
  currentStage: DocumentStage;
  currentStep: number;
  totalSteps: number;
  organizationName: string;
  history: DocumentTransition[];
  permissions: DocumentPermissions;
  attachments: DocumentAttachment[];
  description: string;
};
