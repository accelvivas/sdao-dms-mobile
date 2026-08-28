import { apiClient } from '../api/client';
import type { Document } from '../types/document';

export async function getMyDocuments(): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>('/documents/mine');
  return data;
}

export async function getDocumentById(id: string): Promise<Document> {
  const { data } = await apiClient.get<Document>(`/documents/${id}`);
  return data;
}

export async function getReviewQueue(): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>('/documents/queue');
  return data;
}
