export type UserRole = 'student' | 'approver';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type Session = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type TwoFactorPayload = {
  email: string;
  code: string;
};
