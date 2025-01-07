export const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;
export type Day = (typeof days)[number];

export const roles = [
  'owner',
  'admin',
  'teacher',
  'parent',
  'student',
] as const;

export type Role = (typeof roles)[number];
export const sports = [
  'swimming',
  'soccer',
  'basketball',
  'volleyball',
  'tennis',
  'dance',
  'table_tennis',
] as const;
