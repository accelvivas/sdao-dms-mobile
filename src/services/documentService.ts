import { config } from '../constants/config';
import { apiClient } from '../api/client';
import {
  approveMockDocument,
  getMockDocumentById,
  getMockDocuments,
  rejectMockDocument,
  requestMockDocumentRevision,
} from '../mocks/mockDocuments';
import { throwMockNetworkError, waitForMockResponse } from '../mocks/mockUtils';
import type { Document } from '../types/document';

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

  const { data } = await apiClient.get<Document>(`/documents/${id}`);
  return data;
}

export async function getReviewQueue(): Promise<Document[]> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    return getMockDocuments().filter(
      (document) => document.type === 'activity_proposal' && document.permissions.can_view,
    );
  }

  const { data } = await apiClient.get<Document[]>('/documents/queue');
  return data;
}

export const getActivityProposal = getDocumentById;
export const approveActivityProposal = approveDocument;
export const requestActivityProposalRevision = requestDocumentRevision;
export const rejectActivityProposal = rejectDocument;

export async function approveDocument(id: string): Promise<Document> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    return approveMockDocument(id);
  }

  const { data } = await apiClient.post<Document>(`/documents/${id}/approve`);
  return data;
}

export async function requestDocumentRevision(
  id: string,
  remarks: string,
): Promise<Document> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    return requestMockDocumentRevision(id, remarks);
  }

  const { data } = await apiClient.post<Document>(`/documents/${id}/request-revision`, {
    remarks,
  });
  return data;
}

export async function rejectDocument(id: string, remarks: string): Promise<Document> {
  if (config.useMockData) {
    await waitForMockResponse();
    throwMockNetworkError();
    return rejectMockDocument(id, remarks);
  }

  const { data } = await apiClient.post<Document>(`/documents/${id}/reject`, { remarks });
  return data;
}
