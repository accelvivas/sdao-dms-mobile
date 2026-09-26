import type {
  Document,
  DocumentPermissions,
  DocumentStatus,
  DocumentTransition,
} from '../types/document';

const organizationName = 'NU Lipa Demo Student Organization';

const actionablePermissions: DocumentPermissions = {
  can_view: true,
  can_act: true,
  can_review: true,
  can_approve: true,
  can_request_revision: true,
  can_reject: true,
};

const viewOnlyPermissions: DocumentPermissions = {
  can_view: true,
  can_act: false,
  can_review: false,
  can_approve: false,
  can_request_revision: false,
  can_reject: false,
};

function transition(
  id: string,
  action: string,
  stage: DocumentTransition['stage'],
  actorName: string,
  actorRole: string,
  timestamp: string,
  remarks?: string,
): DocumentTransition {
  return { id, action, stage, actorName, actorRole, timestamp, remarks };
}

export let mockDocuments: Document[] = [
  {
    id: 'PROP-2026-001',
    type: 'activity_proposal',
    title: 'IT Week 2026',
    status: 'in_review',
    submittedBy: 'Demo Student Organization',
    submittedAt: '2026-08-18T08:30:00.000Z',
    updatedAt: '2026-09-12T09:00:00.000Z',
    currentStage: 'adviser_review',
    currentStep: 2,
    totalSteps: 8,
    organizationName,
    description: 'A week-long technology and innovation program for NU Lipa students.',
    permissions: actionablePermissions,
    attachments: [
      {
        id: 'attachment-001',
        fileName: 'it-week-2026-proposal.pdf',
        fileType: 'PDF',
        sizeLabel: '2.4 MB',
        description: 'Activity Proposal request letter and supporting program details',
      },
      {
        id: 'attachment-002',
        fileName: 'it-week-2026-budget.xlsx',
        fileType: 'XLSX',
        sizeLabel: '184 KB',
        description: 'Detailed budget worksheet',
      },
    ],
    history: [
      transition('transition-001', 'Submitted', 'submitted', 'Demo Student Organization', 'Organization Officer', '2026-08-18T08:30:00.000Z'),
      transition('transition-002', 'Adviser Review', 'adviser_review', 'Demo Adviser', 'Adviser', '2026-09-12T09:00:00.000Z'),
    ],
    activityProposal: {
      venue: 'University Activity Room',
      startsAt: '2026-10-10T09:00:00.000Z',
      endsAt: '2026-10-10T11:30:00.000Z',
      natureOfActivity: 'Non-curricular',
      typeOfActivity: 'Seminar/Workshop',
      partnerOrganizations: ['School of Computing and Information Technologies'],
      targetSdgs: ['Quality Education', 'Industry, Innovation and Infrastructure'],
      proposedBudget: 3500,
      budgetSource: 'Organization Fund',
      objectives: [
        'Introduce students to practical technology and innovation concepts.',
        'Encourage collaborative problem solving among participating organizations.',
      ],
      activityDescription: 'A week-long technology and innovation program for NU Lipa students.',
      criteriaMechanics: 'Participants will join facilitated sessions and submit a collaborative output for evaluation.',
      programFlow: [
        { activity: 'Opening remarks and orientation', duration: '15 mins' },
        { activity: 'Technology and innovation sessions', duration: '60 mins' },
        { activity: 'Collaborative workshop', duration: '45 mins' },
        { activity: 'Presentation of outputs and closing', duration: '30 mins' },
      ],
      expenses: [
        { material: 'Printed workshop materials', quantity: 100, unitPrice: 10, total: 1000 },
        { material: 'Event banner', quantity: 1, unitPrice: 500, total: 500 },
        { material: 'Workshop supplies', quantity: 20, unitPrice: 100, total: 2000 },
      ],
      responsiblePersons: [
        { name: 'Demo Student Organization President', role: 'Organization Officer' },
        { name: 'Demo Adviser', role: 'Faculty Adviser' },
      ],
      revisionSections: [
        'RSO Info',
        'Activity Details',
        'Partner Orgs & SDG',
        'Budget',
        'Schedule & Venue',
        'Objectives',
        'Activity Description',
        'Responsible Persons',
        'General',
      ],
      approval: { stageLabel: 'Adviser Approval', approvedCount: 0, totalCount: 1 },
    },
  },
  {
    id: 'PROP-2026-002',
    type: 'activity_proposal',
    title: 'Inter-Organization Leadership Forum',
    status: 'in_review',
    submittedBy: 'Demo Student Organization',
    submittedAt: '2026-09-01T08:20:00.000Z',
    updatedAt: '2026-09-04T10:10:00.000Z',
    currentStage: 'program_chair_review',
    currentStep: 5,
    totalSteps: 8,
    organizationName,
    description: 'A cross-organization leadership forum awaiting another workflow stage.',
    permissions: viewOnlyPermissions,
    attachments: [],
    history: [
      transition('transition-003', 'Submitted', 'submitted', 'Demo Student Organization', 'Organization Officer', '2026-09-01T08:20:00.000Z'),
      transition('transition-004', 'Adviser Approved', 'adviser_review', 'Demo Adviser', 'Adviser', '2026-09-04T10:10:00.000Z'),
      transition('transition-005', 'Program Chair Review', 'program_chair_review', 'Demo Program Chair', 'Program Chair', '2026-09-04T10:10:00.000Z'),
    ],
    activityProposal: {
      venue: 'Main Auditorium',
      startsAt: '2026-11-14T13:00:00.000Z',
      endsAt: '2026-11-14T16:00:00.000Z',
      natureOfActivity: 'Non-curricular',
      typeOfActivity: 'Forum',
      partnerOrganizations: ['Student Affairs Office'],
      targetSdgs: ['Peace, Justice and Strong Institutions'],
      proposedBudget: 5000,
      budgetSource: 'Organization Fund',
      objectives: ['Strengthen leadership and collaboration across student organizations.'],
      activityDescription: 'A cross-organization leadership forum awaiting another workflow stage.',
      programFlow: [
        { activity: 'Registration and opening', duration: '30 mins' },
        { activity: 'Leadership forum', duration: '90 mins' },
        { activity: 'Open discussion and closing', duration: '60 mins' },
      ],
      responsiblePersons: [
        { name: 'Demo Student Organization President', role: 'Organization Officer' },
      ],
      revisionSections: ['Activity Details', 'Objectives', 'General'],
      approval: { stageLabel: 'Program Chair Approval', approvedCount: 1, totalCount: 1 },
    },
  },
];

function cloneDocument(document: Document): Document {
  return {
    ...document,
    permissions: { ...document.permissions },
    attachments: document.attachments.map((attachment) => ({ ...attachment })),
    history: document.history.map((item) => ({ ...item })),
  };
}

export function getMockDocuments(): Document[] {
  return mockDocuments.map(cloneDocument);
}

export function getMockDocumentById(id: string): Document | undefined {
  const document = mockDocuments.find((item) => item.id === id);
  return document ? cloneDocument(document) : undefined;
}

function updateMockDocument(
  id: string,
  status: DocumentStatus,
  action: string,
  remarks?: string,
): Document {
  const document = mockDocuments.find((item) => item.id === id);
  if (!document) {
    throw new Error('Mock Activity Proposal was not found.');
  }

  const timestamp = new Date().toISOString();
  const stage = status === 'rejected' || status === 'approved' ? 'completed' : 'adviser_review';
  document.status = status;
  document.currentStage = stage;
  document.updatedAt = timestamp;
  document.permissions = { ...viewOnlyPermissions };
  document.history.push(
    transition(
      `transition-${Date.now()}`,
      action,
      stage,
      'Demo Adviser',
      'Adviser',
      timestamp,
      remarks,
    ),
  );

  return cloneDocument(document);
}

export function approveMockDocument(id: string): Document {
  return updateMockDocument(id, 'approved', 'Approved');
}

export function requestMockDocumentRevision(id: string, remarks: string): Document {
  return updateMockDocument(id, 'revision_requested', 'Request Revision', remarks);
}

export function rejectMockDocument(id: string, remarks: string): Document {
  return updateMockDocument(id, 'rejected', 'Rejected', remarks);
}
