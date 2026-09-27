import { File, Paths } from 'expo-file-system';

import { apiClient } from '../api/client';
import type { DocumentAttachment } from '../types/document';

export type DownloadedProposalAttachment = {
  uri: string;
  fileName: string;
  mimeType: string;
};

function getResponseFileName(contentDisposition: string | undefined): string | undefined {
  if (!contentDisposition) return undefined;

  const encodedFileName = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition)?.[1];
  const quotedFileName = /filename\s*=\s*"((?:\\.|[^"])*)"/i.exec(contentDisposition)?.[1];
  const plainFileName = /filename\s*=\s*([^;]+)/i.exec(contentDisposition)?.[1];
  const rawFileName = encodedFileName ?? quotedFileName?.replace(/\\(.)/g, '$1') ?? plainFileName;
  if (!rawFileName) return undefined;

  try {
    return decodeURIComponent(rawFileName.trim().replace(/^"|"$/g, ''));
  } catch {
    return rawFileName.trim().replace(/^"|"$/g, '');
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .split(/[\\/]/)
    .pop()!
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_') || 'attachment';
}

export async function downloadProposalAttachment(
  proposalId: string,
  attachment: DocumentAttachment,
): Promise<DownloadedProposalAttachment> {
  const attachmentId = String(attachment.id);
  const safeAttachmentId = attachmentId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const { data, headers } = await apiClient.get<ArrayBuffer>(
    `/documents/${encodeURIComponent(proposalId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
    { responseType: 'arraybuffer', timeout: 120000 },
  );

  const contentDisposition = headers['content-disposition'];
  const fileName = getResponseFileName(contentDisposition) ?? attachment.fileName;
  const safeFileName = sanitizeFileName(fileName);
  const mimeType = String(headers['content-type'] ?? '').split(';')[0].trim()
    || (attachment.fileType.includes('/')
      ? attachment.fileType
      : attachment.fileType.toLowerCase() === 'pdf'
        ? 'application/pdf'
        : 'application/octet-stream');
  const localFile = new File(
    Paths.cache,
    `${safeAttachmentId}-${Date.now()}-${safeFileName}`,
  );
  localFile.create({ intermediates: true, overwrite: true });
  localFile.write(new Uint8Array(data));
  return { uri: localFile.uri, fileName, mimeType };
}