export const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export type Day = (typeof days)[number];

export const roles = [
  'owner',
  'admin',
  'teacher',
  'parent',
  'student',
] as const;

export type Role = (typeof roles)[number];
