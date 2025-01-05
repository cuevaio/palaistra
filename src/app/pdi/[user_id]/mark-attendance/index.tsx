import { redirect } from 'next/navigation';

import { getSession } from '@/auth';

import { pdi_id } from '@/db/pdi/constants';
import { redis } from '@/db/redis';

import { MarkAttendanceButton } from './client';

export const MarkAttendance = async () => {
  const session = await getSession();
  if (!session) redirect('/signin');

  const isAdmin = await redis.sismember(
    `membership|${session.userId}|${pdi_id}`,
    'admin',
  );

  if (!isAdmin) return null;

  return <MarkAttendanceButton />;
};
