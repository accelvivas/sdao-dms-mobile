export type DocumentStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected';

export type Document = {
  id: string;
  title: string;
  status: DocumentStatus;
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
};
