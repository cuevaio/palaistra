import { type UserSelect } from '@/db/schema';

import { type Role } from '@/lib/constants';

export type User = Omit<
  Omit<Omit<UserSelect, 'created_at'>, 'updated_at'>,
  'national_id'
>;

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
};

// membership: membership|${user_id}|${palaistra_id} -> [...roles]
// e.g. membership|abc123456789|zyx987654321 -> ["admin", "teacher"]

export type Membership = Role[];
