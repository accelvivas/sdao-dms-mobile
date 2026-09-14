import type { LoginCredentials, User } from '../types/auth';
import { mockApprovers, type MockApprover } from './mockApprovers';

export const MOCK_INVALID_CREDENTIALS_MESSAGE =
  'These credentials do not match our records.';

export function getMockAccount(credentials: LoginCredentials): MockApprover {
  const account = mockApprovers.find(
    (item) => item.email.toLowerCase() === credentials.email.toLowerCase(),
  );

  if (!account || account.password !== credentials.password) {
    throw new Error(MOCK_INVALID_CREDENTIALS_MESSAGE);
  }

  return account;
}

export function getMockUser(account: MockApprover): User {
  const { password: _password, ...user } = account;
  return user;
}

export function getMockUserByToken(token: string): User | null {
  if (!token.startsWith('mock-token:')) {
    return null;
  }

  const accountId = token.slice('mock-token:'.length);
  const account = mockApprovers.find((item) => String(item.id) === accountId);
  return account ? getMockUser(account) : null;
}

export function getMockToken(user: User): string {
  return `mock-token:${user.id}`;
}
