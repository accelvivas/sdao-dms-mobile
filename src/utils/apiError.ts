import axios from 'axios';

type ApiErrorPayload = {
  message?: unknown;
  errors?: Record<string, unknown>;
};

function parseJsonErrorBody(data: unknown): ApiErrorPayload | undefined {
  if (data !== null && typeof data === 'object' && !(data instanceof ArrayBuffer)) {
    return data as ApiErrorPayload;
  }

  let body: string | undefined;
  if (typeof data === 'string') {
    body = data;
  } else if (data instanceof ArrayBuffer) {
    const bytes = new Uint8Array(data);
    const chunks: string[] = [];
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)));
    }
    body = chunks.join('');
  }

  if (!body) return undefined;
  try {
    return JSON.parse(body) as ApiErrorPayload;
  } catch {
    return undefined;
  }
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return fallback;
  }

  const payload = parseJsonErrorBody(error.response?.data);
  const errors = payload?.errors;
  if (errors) {
    const fieldError = Object.values(errors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (fieldError) {
      return fieldError;
    }
  }

  const message = payload?.message;
  return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
}