import { z } from 'zod';

import type { Document } from '../types/document';

const identifierSchema = z.union([
  z.string().trim().min(1).max(200),
  z.number().finite(),
]);

const dateTimeSchema = z.string().trim().min(1).max(100).refine(
  (value) => !Number.isNaN(Date.parse(value)),
  'Expected a valid date and time.',
);

const optionalTextSchema = z.string().max(10_000).nullish().transform(
  (value) => value ?? undefined,
);

const documentPermissionsSchema = z.object({
  can_view: z.boolean(),
  can_act: z.boolean(),
  can_review: z.boolean(),
  can_approve: z.boolean(),
  can_request_revision: z.boolean(),
  can_reject: z.boolean(),
}).strict();

const documentTransitionSchema = z.object({
  id: identifierSchema.transform(String),
  action: z.string().trim().min(1).max(200),
  stage: z.string().trim().min(1).max(100),
  stageLabel: z.string().trim().min(1).max(200).optional(),
  actorName: z.string().trim().min(1).max(300),
  actorRole: z.string().trim().min(1).max(200),
  timestamp: dateTimeSchema,
  remarks: optionalTextSchema,
}).passthrough();

const attachmentSchema = z.object({
  id: identifierSchema,
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(150),
  sizeLabel: z.string().trim().min(1).max(100),
  description: optionalTextSchema,
}).passthrough();

const activityProposalSchema = z.object({
  venue: optionalTextSchema,
  startsAt: dateTimeSchema.optional(),
  endsAt: dateTimeSchema.optional(),
  natureOfActivity: optionalTextSchema,
  typeOfActivity: optionalTextSchema,
  partnerOrganizations: z.array(z.string().max(300)).max(100).optional(),
  targetSdgs: z.array(z.string().max(300)).max(100).optional(),
  proposedBudget: z.number().finite().nonnegative().optional(),
  budgetSource: optionalTextSchema,
  objectives: z.array(z.string().max(5_000)).max(100).optional(),
  activityDescription: optionalTextSchema,
  criteriaMechanics: optionalTextSchema,
  programFlow: z.array(z.object({
    activity: z.string().max(5_000),
    duration: z.string().max(200).optional(),
  }).passthrough()).max(500).optional(),
  expenses: z.array(z.object({
    material: z.string().max(1_000),
    quantity: z.number().finite().nonnegative(),
    unitPrice: z.number().finite().nonnegative(),
    total: z.number().finite().nonnegative(),
  }).passthrough()).max(1_000).optional(),
  responsiblePersons: z.array(z.object({
    name: z.string().max(300),
    role: z.string().max(300),
  }).passthrough()).max(500).optional(),
  revisionSections: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
  approval: z.object({
    stageLabel: z.string().trim().min(1).max(200),
    approvedCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
  }).passthrough().optional(),
}).passthrough();

const documentSchema = z.object({
  id: identifierSchema.transform(String),
  title: z.string().trim().min(1).max(1_000),
  type: z.literal('activity_proposal'),
  status: z.enum(['pending', 'in_review', 'approved', 'revision_requested', 'rejected']),
  submittedBy: z.string().trim().min(1).max(300),
  submittedAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  currentStage: z.string().trim().min(1).max(100),
  currentStageLabel: z.string().trim().min(1).max(200).optional(),
  currentStep: z.number().int().nonnegative(),
  totalSteps: z.number().int().positive(),
  organizationName: z.string().trim().min(1).max(300),
  history: z.array(documentTransitionSchema).max(5_000).default([]),
  permissions: documentPermissionsSchema,
  attachments: z.array(attachmentSchema).max(500).default([]),
  description: z.string().max(20_000).default(''),
  activityProposal: activityProposalSchema.optional(),
}).passthrough();

export function parseDocumentPayload(value: unknown): Document {
  return documentSchema.parse(value) as Document;
}

export function parseDocumentListPayload(value: unknown): Document[] {
  return z.array(documentSchema).max(5_000).parse(value) as Document[];
}

export const apiUserSchema = z.object({
  id: identifierSchema,
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(300),
  roles: z.array(z.union([
    z.string().trim().min(1).max(100),
    z.object({ name: z.string().trim().min(1).max(100) }).passthrough(),
  ])).max(100).optional(),
  mobile_access: z.boolean().optional(),
  capabilities: z.object({
    can_access_mobile_review: z.boolean().optional(),
  }).passthrough().optional(),
}).passthrough();

export const loginResponseSchema = z.object({
  token: z.string().min(20).max(8_192),
}).passthrough();

export const loginCredentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(1_024),
  code: z.string().trim().min(1).max(100).optional(),
  recoveryCode: z.string().trim().min(1).max(200).optional(),
});

export const reviewNotificationSchema = z.object({
  id: z.string().trim().min(1).max(200),
  type: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(500),
  body: z.string().max(5_000),
  proposal_reference: z.string().trim().min(1).max(200).nullable(),
  read_at: dateTimeSchema.nullable(),
  created_at: dateTimeSchema,
}).passthrough();

export const notificationPageSchema = z.object({
  data: z.array(reviewNotificationSchema).max(500),
  meta: z.object({
    unread_count: z.number().int().nonnegative(),
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }).passthrough(),
  links: z.object({
    prev: z.string().url().nullable(),
    next: z.string().url().nullable(),
  }).passthrough(),
}).passthrough();

export const unreadCountSchema = z.object({
  data: z.object({ unread_count: z.number().int().nonnegative() }).passthrough(),
}).passthrough();

export const readNotificationSchema = z.object({
  data: z.object({
    id: z.string().trim().min(1).max(200),
    read_at: dateTimeSchema,
  }).passthrough(),
}).passthrough();
