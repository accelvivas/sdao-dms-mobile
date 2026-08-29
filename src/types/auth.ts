export type UserRole = 'student' | 'approver';

export type User = {
  id: number | string;
  email: string;
  name: string;
  roles: string[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type TwoFactorChallenge = {
  email: string;
  challengeToken: string;
  code: string;
};

export type LoginSuccess = {
  requiresTwoFactor: false;
  user: User;
};

export type LoginNeedsTwoFactor = {
  requiresTwoFactor: true;
  challengeToken: string;
};

export type LoginResult = LoginSuccess | LoginNeedsTwoFactor;

export function hasRole(user: User, role: string): boolean {
  const target = role.toLowerCase();
  return user.roles.some((item) => item.toLowerCase() === target);
}

export function getAppRole(user: User): UserRole {
  if (hasRole(user, 'approver')) {
    return 'approver';
  }

  return 'student';
}
