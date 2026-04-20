export enum Role {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  COORDINATOR = 'coordinator',
  PRINCIPAL = 'principal',
  ADMIN = 'admin',
}

export const ROLE_LEVEL: Record<Role, number> = {
  [Role.STUDENT]: 0,
  [Role.PARENT]: 1,
  [Role.TEACHER]: 2,
  [Role.COORDINATOR]: 3,
  [Role.PRINCIPAL]: 4,
  [Role.ADMIN]: 5,
};
