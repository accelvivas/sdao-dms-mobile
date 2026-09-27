import { File, Paths } from 'expo-file-system';

import { apiClient } from '../api/client';
import type { DocumentAttachment } from '../types/document';

export async function downloadProposalAttachment(
  proposalId: string,
  attachment: DocumentAttachment,
): Promise<string> {
  const safeAttachmentId = attachment.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = attachment.fileName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
  const localFile = new File(
    Paths.cache,
    `${safeAttachmentId}-${Date.now()}-${safeFileName || 'attachment'}`,
  );
  const { data } = await apiClient.get<ArrayBuffer>(
    `/documents/${encodeURIComponent(proposalId)}/attachments/${encodeURIComponent(attachment.id)}/download`,
    { responseType: 'arraybuffer', timeout: 120000 },
  );

  localFile.create({ intermediates: true, overwrite: true });
  localFile.write(new Uint8Array(data));
  return localFile.uri;
}