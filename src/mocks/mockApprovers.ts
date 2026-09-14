import type { User } from '../types/auth';

export type MockApprover = User & {
  password: string;
};

export const mockApprovers: MockApprover[] = [
  {
    id: 'mock-adviser-001',
    email: 'demo.adviser@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Adviser',
    roles: ['approver', 'adviser'],
    roleAssignments: [
      {
        role: 'adviser',
        label: 'Adviser',
        organizationName: 'NU Lipa Demo Student Organization',
      },
    ],
    organizationName: 'NU Lipa Demo Student Organization',
    mobileAccess: true,
  },
  {
    id: 'mock-chair-001',
    email: 'demo.chair@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Program Chair',
    roles: ['approver', 'program_chair'],
    roleAssignments: [
      {
        role: 'program_chair',
        label: 'Program Chair',
        programName: 'Demo Information Technology Program',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-dean-001',
    email: 'demo.dean@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Dean',
    roles: ['approver', 'dean'],
    roleAssignments: [
      {
        role: 'dean',
        label: 'Dean',
        schoolName: 'NU Lipa School of Computing',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-principal-001',
    email: 'demo.principal@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo SHS Principal',
    roles: ['approver', 'principal'],
    roleAssignments: [
      {
        role: 'principal',
        label: 'Principal',
        schoolName: 'NU Lipa Senior High School',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-sdao-member-001',
    email: 'demo.sdao@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo SDAO Member',
    roles: ['approver', 'sdao_member'],
    roleAssignments: [
      {
        role: 'sdao_member',
        label: 'SDAO Member',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-assistant-director-001',
    email: 'demo.academicservices@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Assistant Director Academic Services',
    roles: ['approver', 'assistant_director_academic_services'],
    roleAssignments: [
      {
        role: 'assistant_director_academic_services',
        label: 'Assistant Director Academic Services',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-academic-director-001',
    email: 'demo.academicdirector@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Academic Director',
    roles: ['approver', 'academic_director'],
    roleAssignments: [
      {
        role: 'academic_director',
        label: 'Academic Director',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-executive-director-001',
    email: 'demo.executivedirector@nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo Executive Director',
    roles: ['approver', 'executive_director'],
    roleAssignments: [
      {
        role: 'executive_director',
        label: 'Executive Director',
      },
    ],
    mobileAccess: true,
  },
  {
    id: 'mock-president-001',
    email: 'demo.president@students.nu-lipa.edu.ph',
    password: 'Password123!',
    name: 'Demo RSO President',
    roles: ['president'],
    roleAssignments: [
      {
        role: 'president',
        label: 'RSO President',
        organizationName: 'NU Lipa Demo Student Organization',
      },
    ],
    organizationName: 'NU Lipa Demo Student Organization',
    mobileAccess: false,
  },
];
