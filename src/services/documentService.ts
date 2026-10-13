import { config } from '../constants/config';
import { apiClient } from '../api/client';
import { invalidateApprovalLogs } from './approvalLogService';
import {
  approveMockDocument,
  getMockDocumentById,
  getMockDocuments,
  rejectMockDocument,
  requestMockDocumentRevision,
} from '../mocks/mockDocuments';
import { throwMockNetworkError, waitForMockResponse } from '../mocks/mockUtils';
import type { Document } from '../types/document';
import {
  parseDocumentListPayload,
  parseDocumentPayload,
} from '../validation/apiSchemas';

type ApprovePayload = {
  remarks?: string;
};

function normalizeApiKeys<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiKeys(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (key === 'permissions') {
          return [key, item];
        }

        return [
          key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()),
          normalizeApiKeys(item),
        ];
      }),
    ) as T;
  }

  return value as T;
}

export async function getDocumentById(id: string): Promise<Document> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    const document = getMockDocumentById(id);
    if (!document) {
      throw new Error('Document not found.');
    }
    return document;
  }

  const { data } = await apiClient.get<unknown>(`/documents/${encodeURIComponent(id)}`);
  return parseDocumentPayload(normalizeApiKeys<unknown>(data));
}

export async function getReviewQueue(): Promise<Document[]> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    return getMockDocuments().filter(
      (document) => document.type === 'activity_proposal' && document.permissions.can_view,
    );
  }

  const { data } = await apiClient.get<unknown>('/documents/queue');
  const normalized = Array.isArray(data)
    ? data.map((item) => normalizeApiKeys<unknown>(item))
    : data;
  return parseDocumentListPayload(normalized);
}

export const getActivityProposal = getDocumentById;
export const approveActivityProposal = approveDocument;
export const requestActivityProposalRevision = requestDocumentRevision;
export const rejectActivityProposal = rejectDocument;

export async function approveDocument(id: string, remarks?: string): Promise<Document> {
  const safeRemarks = remarks?.trim();
  if (safeRemarks && safeRemarks.length > 1_000) {
    throw new Error('Approval remarks must not exceed 1,000 characters.');
  }

  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    const document = approveMockDocument(id, safeRemarks);
    invalidateApprovalLogs();
    return document;
  }

  const payload: ApprovePayload = safeRemarks ? { remarks: safeRemarks } : {};
  const { data } = await apiClient.post<unknown>(
    `/documents/${encodeURIComponent(id)}/approve`,
    payload,
  );
  const document = parseDocumentPayload(normalizeApiKeys<unknown>(data));
  invalidateApprovalLogs();
  return document;
}

export async function requestDocumentRevision(
  id: string,
  remarks: string,
): Promise<Document> {
  const safeRemarks = remarks.trim();
  if (!safeRemarks || safeRemarks.length > 2_000) {
    throw new Error('Revision remarks must contain between 1 and 2,000 characters.');
  }

  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    const document = requestMockDocumentRevision(id, safeRemarks);
    invalidateApprovalLogs();
    return document;
  }

  const { data } = await apiClient.post<unknown>(
    `/documents/${encodeURIComponent(id)}/request-revision`,
    {
      remarks: safeRemarks,
    },
  );
  const document = parseDocumentPayload(normalizeApiKeys<unknown>(data));
  invalidateApprovalLogs();
  return document;
}

export async function rejectDocument(id: string, remarks: string): Promise<Document> {
  const safeRemarks = remarks.trim();
  if (!safeRemarks || safeRemarks.length > 2_000) {
    throw new Error('Rejection remarks must contain between 1 and 2,000 characters.');
  }

  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    const document = rejectMockDocument(id, safeRemarks);
    invalidateApprovalLogs();
    return document;
  }

  const { data } = await apiClient.post<unknown>(
    `/documents/${encodeURIComponent(id)}/reject`,
    { remarks: safeRemarks },
  );
  const document = parseDocumentPayload(normalizeApiKeys<unknown>(data));
  invalidateApprovalLogs();
  return document;
}
