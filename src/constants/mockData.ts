import type { Document } from '../types/document';

export const mockDocuments: Document[] = [
  {
    id: 'DOC-1042',
    title: 'Request for Certificate of Good Moral',
    status: 'pending',
    submittedBy: 'You',
    submittedAt: '2026-08-26T09:15:00.000Z',
    updatedAt: '2026-08-26T09:15:00.000Z',
  },
  {
    id: 'DOC-1038',
    title: 'Leave of Absence Application',
    status: 'in_review',
    submittedBy: 'You',
    submittedAt: '2026-08-21T14:02:00.000Z',
    updatedAt: '2026-08-28T11:40:00.000Z',
  },
  {
    id: 'DOC-1019',
    title: 'Organization Accreditation Form',
    status: 'approved',
    submittedBy: 'You',
    submittedAt: '2026-08-12T08:30:00.000Z',
    updatedAt: '2026-08-18T16:05:00.000Z',
  },
  {
    id: 'DOC-1004',
    title: 'Activity Permit — Intramurals',
    status: 'rejected',
    submittedBy: 'You',
    submittedAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-07T13:22:00.000Z',
  },
];

export const mockQueue: Document[] = [
  {
    id: 'DOC-1108',
    title: 'Excuse Letter — Midterm Exam',
    status: 'pending',
    submittedBy: 'Maria Santos',
    submittedAt: '2026-08-29T07:45:00.000Z',
    updatedAt: '2026-08-29T07:45:00.000Z',
  },
  {
    id: 'DOC-1106',
    title: 'Request for Official Transcript Copy',
    status: 'in_review',
    submittedBy: 'Jose Ramirez',
    submittedAt: '2026-08-28T16:20:00.000Z',
    updatedAt: '2026-08-29T08:10:00.000Z',
  },
  {
    id: 'DOC-1099',
    title: 'Clearance for Graduation',
    status: 'pending',
    submittedBy: 'Alyssa Cruz',
    submittedAt: '2026-08-27T11:05:00.000Z',
    updatedAt: '2026-08-27T11:05:00.000Z',
  },
];

export const mockNotifications = [
  {
    id: 'n1',
    title: 'Document in review',
    body: 'Leave of Absence Application is now being reviewed.',
    createdAt: '2026-08-28T11:40:00.000Z',
    read: false,
  },
  {
    id: 'n2',
    title: 'Request approved',
    body: 'Organization Accreditation Form has been approved.',
    createdAt: '2026-08-18T16:05:00.000Z',
    read: true,
  },
  {
    id: 'n3',
    title: 'Action required',
    body: 'Activity Permit — Intramurals was returned with comments.',
    createdAt: '2026-08-07T13:22:00.000Z',
    read: true,
  },
];
