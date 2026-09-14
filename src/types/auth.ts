export type UserRole =
  | 'student'
  | 'president'
  | 'approver'
  | 'adviser'
  | 'program_chair'
  | 'dean'
  | 'principal'
  | 'sdao_member'
  | 'assistant_director_academic_services'
  | 'academic_director'
  | 'executive_director';

export type RoleAssignment = {
  role: UserRole;
  label: string;
  organizationName?: string;
  programName?: string;
  schoolName?: string;
};

export type User = {
  id: number | string;
  email: string;
  name: string;
  roles: string[];
  roleAssignments: RoleAssignment[];
  organizationName?: string;
  mobileAccess: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginSuccess = {
  user: User;
};

export type LoginResult = LoginSuccess;

export type AuthResponse = LoginResult;

export function hasRole(user: User, role: string): boolean {
  const target = role.toLowerCase();
  return user.roles.some((item) => item.toLowerCase() === target);
}

export function canAccessMobileReview(user: User): boolean {
  return user.mobileAccess && hasRole(user, 'approver');
}
