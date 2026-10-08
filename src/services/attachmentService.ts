import { File, Paths } from 'expo-file-system';

import { apiClient } from '../api/client';
import type { DocumentAttachment } from '../types/document';

export type DownloadedProposalAttachment = {
  uri: string;
  fileName: string;
  mimeType: string;
};

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

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

  if (data.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error('This attachment exceeds the 25 MB mobile download limit.');
  }

  const contentDisposition = headers['content-disposition'];
  const fileName = getResponseFileName(contentDisposition) ?? attachment.fileName;
  const safeFileName = sanitizeFileName(fileName);
  const candidateMimeType = String(headers['content-type'] ?? '').split(';')[0].trim();
  const mimeType = (/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(candidateMimeType)
    ? candidateMimeType
    : '')
    || (attachment.fileType.includes('/')
      ? attachment.fileType
      : attachment.fileType.toLowerCase() === 'pdf'
        ? 'application/pdf'
        : 'application/octet-stream');
  const localFile = new File(
    Paths.cache,
    `sdao-attachment-${safeAttachmentId}-${Date.now()}-${safeFileName}`,
  );
  localFile.create({ intermediates: true, overwrite: true });
  localFile.write(new Uint8Array(data));
  return { uri: localFile.uri, fileName: safeFileName, mimeType };
}

export function deleteDownloadedProposalAttachment(uri: string): void {
  const localFile = new File(uri);
  if (localFile.exists) {
    localFile.delete();
  }
}
