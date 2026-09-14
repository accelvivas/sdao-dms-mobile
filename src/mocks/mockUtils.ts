import { config } from '../constants/config';

export async function waitForMockResponse(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, config.mockDelayMs);
  });
}

export function throwMockNetworkError(): void {
  if (config.mockNetworkError) {
    throw new Error('Mock network error. Disable config.mockNetworkError to continue.');
  }
}
